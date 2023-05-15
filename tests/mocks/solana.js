import Blockchains from '@depay/web3-blockchains'
import { struct, u64, Buffer, PublicKey } from '@depay/solana-web3.js'
import { ethers } from 'ethers'
import { getProvider } from '@depay/web3-client'
import { mock } from '@depay/web3-mock'
import { routers } from 'src'
import { Token } from '@depay/web3-tokens'

const blockchain = 'solana'

const getTokenAccountAddress = async({ tokenAddress, ownerAddress })=>{

  return await Token.solana.findProgramAddress({
    token: tokenAddress,
    owner: ownerAddress
  })
}

const mockTokenAccount = async({ provider, tokenAddress, ownerAddress, exists, balance })=>{

  mock({
    blockchain: 'solana',
    provider,
    request: {
      method: 'getAccountInfo',
      to: await getTokenAccountAddress({ tokenAddress, ownerAddress }),
      api: Token.solana.TOKEN_LAYOUT,
      return: exists ? {
        mint: tokenAddress,
        owner: ownerAddress,
        amount: balance ? balance : '0',
        delegateOption: 70962703,
        delegate: 'BSFGxQ38xesdoUd3qsvNhjRu2FLPq9CwCBiGE42fc9hR',
        state: 0,
        isNativeOption: 0,
        isNative: '0',
        delegatedAmount: '0',
        closeAuthorityOption: 0,
        closeAuthority: '11111111111111111111111111111111'
      } : null
    }
  })
}

const getPaymentsAccountPublicKey = async({ fromAddress })=> {
  let seeds = [Buffer.from("payments"), new PublicKey(fromAddress).toBuffer()]

  let [ pdaPublicKey ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const mockPaymentsAccount = async({ provider, fromAddress, nonce }) => {

  let requestMock = mock({
    provider,
    blockchain,
    request: {
      method: 'getAccountInfo',
      to: (await getPaymentsAccountPublicKey({ fromAddress })).toString(),
      api: struct([
        u64('anchorDiscriminator'),
        u64('nonce'),
      ]),
      return: nonce ? { nonce } : null
    }
  })
}

const mockTokenBalance = async({ provider, tokenAddress, tokenDecimals, fromAddress, balance }) => {

  return mock({
    provider,
    blockchain,
    request: {
      method: 'getTokenAccountBalance',
      to: await Token.solana.findProgramAddress({ token: tokenAddress, owner: fromAddress }),
      return: {
        amount: balance,
        decimals: tokenDecimals,
        uiAmount: parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)),
        uiAmountString: ethers.utils.formatUnits(balance, tokenDecimals).toString()
      }
    }
  })
}

const mockMajorTokens = async({ provider })=>{

  await Promise.all(Blockchains.solana.tokens.map((token)=>{

    mock({ blockchain: 'solana', provider, 
      request: {
        to: token.address,
        api: Token.solana.MINT_LAYOUT,
        return: {
          mintAuthorityOption: 1,
          mintAuthority: "2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9",
          supply: "5034999492452932",
          decimals: token.decimals,
          isInitialized: true,
          freezeAuthorityOption: 1,
          freezeAuthority: "3sNBr7kMccME5D55xNgsmYpZnzPgP2g12CixAajXypn6"
        }
      }
    })
  }))
}

const mockMajorTokenBalances = async({ provider, fromAddress })=>{

  mock({ provider, blockchain, balance: { for: fromAddress, return: 0 } })

  await Promise.all(Blockchains.solana.tokens.map((token)=>{
    return mockTokenBalance({ provider, tokenAddress: token.address, tokenDecimals: token.decimals, fromAddress, balance: '0' })
  }))
}

const mockBasics = async({ provider, fromAddress, toAddress, feeReceiverAddress, tokenAddress })=>{

  mock({
    provider,
    blockchain,
    request: {
      address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      api: Token.solana.TOKEN_LAYOUT
    }
  })

  await mockMajorTokens({ provider })
  await mockMajorTokenBalances({ provider, fromAddress })

  mock({ provider, blockchain, balance: { for: toAddress, return: 0 } })

  if(feeReceiverAddress) {
    mock({ provider, blockchain, balance: { for: feeReceiverAddress, return: 0 } })
  }

  await mockPaymentsAccount({ provider, fromAddress })

  mock({ provider, blockchain, request: { method: 'getMinimumBalanceForRentExemption', params: [0], return: 890880 } })

  if(tokenAddress) {
    await mockTokenAccount({ provider, ownerAddress: fromAddress, tokenAddress })
    await mockTokenAccount({ provider, ownerAddress: toAddress, tokenAddress })
    if(feeReceiverAddress) {
      await mockTokenAccount({ provider, ownerAddress: feeReceiverAddress, tokenAddress })
    }
  }
}

export {
  mockBasics,
  getPaymentsAccountPublicKey,
  mockPaymentsAccount,
  mockTokenBalance,
  getTokenAccountAddress,
  mockTokenAccount,
}
