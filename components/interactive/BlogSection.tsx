'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
}

const mockBlogPosts: BlogPost[] = [
  // Blog posts would be fetched from a real blog platform or CMS
  // For now, showing empty array to indicate no blog integration
];

export default function BlogSection() {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const allTags = Array.from(new Set(mockBlogPosts.flatMap(post => post.tags)));

  const filteredPosts = mockBlogPosts.filter(post => {
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='section-heading'>Latest Blog Posts</h2>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Search posts...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='px-3 py-1 text-sm bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          />
        </div>
      </div>

      {/* Tag Filter */}
      <div className='flex flex-wrap gap-2 mb-6'>
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedTag === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedTag === tag
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className='mb-8'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
            <span className='text-yellow-500'>⭐</span>
            Featured Posts
          </h3>
          <div className='grid gap-4'>
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className='card relative overflow-hidden'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className='absolute top-4 right-4'>
                  <span className='px-2 py-1 bg-yellow-500 text-white text-xs rounded-full'>
                    Featured
                  </span>
                </div>

                <div className='pr-20'>
                  <h4 className='text-lg font-bold mb-2 hover:text-[var(--primary)] transition-colors cursor-pointer'>
                    {post.title}
                  </h4>
                  <p className='text-[var(--text-secondary)] mb-3 line-clamp-2'>
                    {post.excerpt}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-[var(--text-secondary)]'>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-3'>
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className='px-2 py-1 bg-[var(--background)] text-xs rounded-full'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      <div className='grid md:grid-cols-2 gap-4'>
        {regularPosts.map((post, index) => (
          <motion.div
            key={post.id}
            className='card'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h4 className='font-bold mb-2 hover:text-[var(--primary)] transition-colors cursor-pointer line-clamp-2'>
              {post.title}
            </h4>
            <p className='text-[var(--text-secondary)] mb-3 text-sm line-clamp-3'>
              {post.excerpt}
            </p>
            <div className='flex items-center justify-between text-xs text-[var(--text-secondary)] mb-3'>
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <span>{post.readTime}</span>
            </div>
            <div className='flex flex-wrap gap-1'>
              {post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className='px-2 py-1 bg-[var(--background)] text-xs rounded-full'
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <motion.div
          className='text-center py-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className='text-[var(--text-secondary)]'>No blog posts found matching your criteria</p>
        </motion.div>
      )}

      {/* Newsletter Signup */}
      <motion.div
        className='mt-8 card text-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className='text-lg font-bold mb-2'>Stay Updated</h3>
        <p className='text-[var(--text-secondary)] mb-4'>
          Subscribe to get notified about new blog posts and updates
        </p>
        <div className='flex gap-2 max-w-md mx-auto'>
          <input
            type='email'
            placeholder='Enter your email'
            className='flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          />
          <button className='px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md transition-colors'>
            Subscribe
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
