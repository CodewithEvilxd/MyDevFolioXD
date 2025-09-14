'use client';

import { useState, useEffect } from 'react';
import { Repository, GitHubUser } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillNFT {
  id: string;
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  tokenId: string;
  contractAddress: string;
  mintedDate: string;
  verificationProof: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  attributes: {
    experience: number;
    projects: number;
    stars: number;
    contributions: number;
  };
  blockchainTx: string;
}

interface BlockchainVerifiedSkillNFTsProps {
  username: string;
  user: GitHubUser;
  repos: Repository[];
}

export default function BlockchainVerifiedSkillNFTs({ username, user, repos }: BlockchainVerifiedSkillNFTsProps) {
  const [skillNFTs, setSkillNFTs] = useState<SkillNFT[]>([]);
  const [mintingSkill, setMintingSkill] = useState<string | null>(null);
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Load existing NFTs from localStorage (simulating blockchain storage)
    const saved = localStorage.getItem(`skill_nfts_${username}`);
    if (saved) {
      setSkillNFTs(JSON.parse(saved));
    }

    // Check for wallet connection (simulated)
    checkWalletConnection();
  }, [username]);

  const checkWalletConnection = async () => {
    // Simulate wallet connection check
    const connected = localStorage.getItem('wallet_connected') === 'true';
    setBlockchainConnected(connected);
    if (connected) {
      setWalletAddress(localStorage.getItem('wallet_address') || '0x1234...abcd');
    }
  };

  const connectWallet = async () => {
    // Simulate wallet connection
    setBlockchainConnected(true);
    const mockAddress = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
    setWalletAddress(mockAddress);
    localStorage.setItem('wallet_connected', 'true');
    localStorage.setItem('wallet_address', mockAddress);
  };

  const analyzeSkills = () => {
    const skills: Record<string, any> = {};

    repos.forEach(repo => {
      if (repo.language) {
        if (!skills[repo.language]) {
          skills[repo.language] = {
            experience: 0,
            projects: 0,
            stars: 0,
            contributions: 0
          };
        }
        skills[repo.language].projects += 1;
        skills[repo.language].stars += repo.stargazers_count;
      }
    });

    // Add years of experience
    const yearsActive = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));

    Object.keys(skills).forEach(skill => {
      skills[skill].experience = yearsActive;
      skills[skill].contributions = Math.floor(Math.random() * 100) + 10; // Simulated
    });

    return skills;
  };

  const calculateSkillLevel = (attributes: any): SkillNFT['level'] => {
    const score = (
      attributes.experience * 10 +
      attributes.projects * 5 +
      attributes.stars * 2 +
      attributes.contributions
    );

    if (score > 500) return 'Master';
    if (score > 200) return 'Expert';
    if (score > 100) return 'Advanced';
    if (score > 50) return 'Intermediate';
    return 'Beginner';
  };

  const calculateRarity = (level: string, attributes: any): SkillNFT['rarity'] => {
    const score = attributes.projects + attributes.stars + attributes.contributions;

    if (level === 'Master' && score > 100) return 'Legendary';
    if (level === 'Expert' && score > 50) return 'Epic';
    if (level === 'Advanced' && score > 25) return 'Rare';
    if (score > 10) return 'Uncommon';
    return 'Common';
  };

  const mintSkillNFT = async (skill: string) => {
    if (mintingSkill || !blockchainConnected) return;

    setMintingSkill(skill);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      const skills = analyzeSkills();
      const attributes = skills[skill];
      const level = calculateSkillLevel(attributes);
      const rarity = calculateRarity(level, attributes);

      const newNFT: SkillNFT = {
        id: `nft_${skill}_${Date.now()}`,
        skill,
        level,
        tokenId: `0x${Math.random().toString(16).substr(2, 64)}`,
        contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        mintedDate: new Date().toISOString(),
        verificationProof: `github_verified_${username}_${skill}_${Date.now()}`,
        rarity,
        attributes,
        blockchainTx: `0x${Math.random().toString(16).substr(2, 64)}`
      };

      const updatedNFTs = [...skillNFTs, newNFT];
      setSkillNFTs(updatedNFTs);
      localStorage.setItem(`skill_nfts_${username}`, JSON.stringify(updatedNFTs));

    } catch (error) {
      
    } finally {
      setMintingSkill(null);
    }
  };

  const skills = analyzeSkills();
  const availableSkills = Object.keys(skills).filter(skill =>
    !skillNFTs.some(nft => nft.skill === skill)
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Master': return 'text-purple-500 bg-purple-500/20 border-purple-500';
      case 'Expert': return 'text-red-500 bg-red-500/20 border-red-500';
      case 'Advanced': return 'text-orange-500 bg-orange-500/20 border-orange-500';
      case 'Intermediate': return 'text-blue-500 bg-blue-500/20 border-blue-500';
      case 'Beginner': return 'text-green-500 bg-green-500/20 border-green-500';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'Epic': return 'text-pink-500 bg-pink-500/10 border-pink-500';
      case 'Rare': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      case 'Uncommon': return 'text-green-500 bg-green-500/10 border-green-500';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Blockchain-Verified Skill NFTs</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Mint cryptographic NFTs for your coding skills and achievements
          </p>
        </div>

        {!blockchainConnected ? (
          <button
            onClick={connectWallet}
            className='px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all font-medium flex items-center gap-2'
          >
            <span>🔗</span>
            Connect Wallet
          </button>
        ) : (
          <div className='flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-sm font-medium text-green-600'>
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {/* NFT Collection */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        <AnimatePresence>
          {skillNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              className='relative p-4 border border-[var(--card-border)] rounded-lg bg-gradient-to-br from-gray-900/50 to-purple-900/20 overflow-hidden'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {/* NFT Glow Effect */}
              <div className={`absolute inset-0 opacity-20 ${
                nft.rarity === 'Legendary' ? 'bg-yellow-500' :
                nft.rarity === 'Epic' ? 'bg-pink-500' :
                nft.rarity === 'Rare' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />

              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-3'>
                  <div className={`px-2 py-1 text-xs rounded-full border ${getLevelColor(nft.level)}`}>
                    {nft.level}
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full border ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </div>
                </div>

                <div className='text-center mb-4'>
                  <div className='text-3xl mb-2'>
                    {nft.skill === 'JavaScript' && '🟨'}
                    {nft.skill === 'TypeScript' && '🔷'}
                    {nft.skill === 'Python' && '🐍'}
                    {nft.skill === 'Java' && '☕'}
                    {nft.skill === 'React' && '⚛️'}
                    {!['JavaScript', 'TypeScript', 'Python', 'Java', 'React'].includes(nft.skill) && '💎'}
                  </div>
                  <h3 className='font-bold text-lg'>{nft.skill}</h3>
                  <p className='text-xs text-[var(--text-secondary)]'>NFT #{nft.tokenId.slice(-4)}</p>
                </div>

                <div className='grid grid-cols-2 gap-2 text-xs mb-3'>
                  <div className='text-center'>
                    <div className='font-bold text-[var(--primary)]'>{nft.attributes.projects}</div>
                    <div className='text-[var(--text-secondary)]'>Projects</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-bold text-[var(--primary)]'>{nft.attributes.stars}</div>
                    <div className='text-[var(--text-secondary)]'>Stars</div>
                  </div>
                </div>

                <div className='text-xs text-[var(--text-secondary)] text-center'>
                  Minted: {new Date(nft.mintedDate).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mint New NFTs */}
      {blockchainConnected && availableSkills.length > 0 && (
        <div className='border-t border-[var(--card-border)] pt-6'>
          <h3 className='text-lg font-semibold mb-4'>Mint New Skill NFTs</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {availableSkills.map(skill => (
              <button
                key={skill}
                onClick={() => mintSkillNFT(skill)}
                disabled={mintingSkill === skill}
                className='p-3 border border-[var(--card-border)] rounded-lg hover:border-[var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {mintingSkill === skill ? (
                  <div className='text-center'>
                    <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2'></div>
                    <div className='text-xs text-[var(--text-secondary)]'>Minting...</div>
                  </div>
                ) : (
                  <div className='text-center'>
                    <div className='text-2xl mb-2'>
                      {skill === 'JavaScript' && '🟨'}
                      {skill === 'TypeScript' && '🔷'}
                      {skill === 'Python' && '🐍'}
                      {skill === 'Java' && '☕'}
                      {!['JavaScript', 'TypeScript', 'Python', 'Java'].includes(skill) && '💎'}
                    </div>
                    <div className='font-medium text-sm'>{skill}</div>
                    <div className='text-xs text-[var(--text-secondary)] mt-1'>Click to mint</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!blockchainConnected && (
        <div className='text-center py-8 border-t border-[var(--card-border)] pt-6'>
          <div className='w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🔗</span>
          </div>
          <h3 className='text-lg font-bold mb-2'>Connect Your Wallet</h3>
          <p className='text-[var(--text-secondary)] mb-4'>
            Connect a blockchain wallet to mint and manage your skill NFTs
          </p>
        </div>
      )}

      {/* Blockchain Info */}
      <div className='mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700'>
        <h3 className='text-white font-semibold mb-3'>Blockchain Information</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <div className='text-gray-400'>Network</div>
            <div className='text-white font-medium'>Ethereum</div>
          </div>
          <div>
            <div className='text-gray-400'>Contract</div>
            <div className='text-white font-medium font-mono text-xs'>
              0x742d...f44e
            </div>
          </div>
          <div>
            <div className='text-gray-400'>Standard</div>
            <div className='text-white font-medium'>ERC-721</div>
          </div>
          <div>
            <div className='text-gray-400'>Total Minted</div>
            <div className='text-white font-medium'>{skillNFTs.length}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
