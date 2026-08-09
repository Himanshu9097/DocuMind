import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Robot, ArrowRight, Lightning, Shield, MagnifyingGlass, Brain } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function Landing() {
  return (
    <div className="bg-canvas flex flex-col items-center min-h-[100dvh] overflow-x-hidden">
      
      {/* Asymmetric Hero Section */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Column: Typography & CTAs */}
        <motion.div 
          className="flex flex-col items-start text-left relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-soft border border-hairline-soft mb-8">
            <Lightning weight="fill" size={14} className="text-primary" />
            <span className="text-[13px] font-bold text-ink-deep uppercase tracking-wide">Powered by Cloudflare AI</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-[56px] md:text-[80px] lg:text-[100px] font-semibold text-ink-deep leading-[0.95] tracking-tighter mb-8">
            Chat with <br /> your PDFs.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-[18px] md:text-[20px] text-charcoal font-normal max-w-[45ch] mb-10 leading-relaxed">
            Upload documents, research papers, or manuals, and let our AI extract the exact information you need in seconds with perfect citations.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-deep text-white text-[16px] font-medium py-4 px-8 rounded-full transition-all shadow-[0_8px_20px_-8px_rgba(0,112,243,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Start for free <ArrowRight weight="bold" size={18} />
            </Link>
            <a 
              href="#how-it-works" 
              className="inline-flex items-center justify-center gap-2 bg-transparent text-charcoal hover:text-ink-deep text-[16px] font-medium py-4 px-8 rounded-full transition-all hover:bg-surface-soft"
            >
              See how it works
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column: Liquid Glass Mockup */}
        <motion.div 
          className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/3] rounded-[2.5rem] bg-surface-soft border border-hairline-soft overflow-hidden shadow-diffusion flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
        >
          {/* Abstract Refraction Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-soft to-surface-soft opacity-60"></div>
          
          {/* Inner Liquid Glass Card */}
          <div className="relative w-[80%] h-[70%] rounded-xxl bg-canvas/60 backdrop-blur-xl border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_-10px_rgba(0,0,0,0.1)] flex flex-col p-6 overflow-hidden">
             {/* Fake UI Header */}
             <div className="w-full flex justify-between items-center mb-6">
                <div className="w-24 h-3 bg-hairline rounded-full"></div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Brain weight="duotone" className="text-primary" size={16}/></div>
             </div>
             {/* Fake UI Messages */}
             <div className="flex-1 flex flex-col gap-4">
                <div className="w-[80%] h-12 bg-surface-soft rounded-xl self-end rounded-tr-sm"></div>
                <div className="w-[90%] h-24 bg-primary-soft rounded-xl self-start rounded-tl-sm border border-primary/10"></div>
             </div>
          </div>
        </motion.div>

      </section>

      {/* Features / How it works */}
      <section id="how-it-works" className="w-full bg-surface-soft py-32 border-t border-hairline-soft">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-[40px] md:text-[56px] font-semibold text-ink-deep tracking-tighter mb-4 leading-none">
              Everything you need.
            </h2>
            <p className="text-[18px] text-charcoal">Powerful AI tools wrapped in a beautiful, highly-responsive interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            
            <div className="bg-canvas p-10 rounded-[2rem] border border-hairline-soft shadow-sm hover:shadow-diffusion transition-shadow group">
              <div className="w-16 h-16 bg-surface-soft rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-soft transition-all duration-500">
                <FileText weight="duotone" className="text-primary" size={32} />
              </div>
              <h3 className="text-[24px] font-semibold text-ink-deep mb-3 tracking-tight">Upload Files</h3>
              <p className="text-[16px] text-charcoal leading-relaxed">
                Drag and drop your PDFs into our secure workspace. We instantly process and vector-index every page.
              </p>
            </div>

            <div className="bg-canvas p-10 rounded-[2rem] border border-hairline-soft shadow-sm hover:shadow-diffusion transition-shadow group">
              <div className="w-16 h-16 bg-surface-soft rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-soft transition-all duration-500">
                <MagnifyingGlass weight="duotone" className="text-primary" size={32} />
              </div>
              <h3 className="text-[24px] font-semibold text-ink-deep mb-3 tracking-tight">Ask Anything</h3>
              <p className="text-[16px] text-charcoal leading-relaxed">
                Chat naturally with your documents. Find specific clauses, summarize chapters, or extract key data.
              </p>
            </div>

            <div className="bg-canvas p-10 rounded-[2rem] border border-hairline-soft shadow-sm hover:shadow-diffusion transition-shadow group">
              <div className="w-16 h-16 bg-surface-soft rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-soft transition-all duration-500">
                <Shield weight="duotone" className="text-primary" size={32} />
              </div>
              <h3 className="text-[24px] font-semibold text-ink-deep mb-3 tracking-tight">Exact Citations</h3>
              <p className="text-[16px] text-charcoal leading-relaxed">
                Never guess where an answer came from. Get exact text snippets and filenames sourced directly from your PDFs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full max-w-[1400px] mx-auto px-4 py-32 text-center flex flex-col items-center">
        <h2 className="text-[48px] md:text-[72px] font-semibold text-ink-deep tracking-tighter mb-8 leading-none">
          Unlock your docs.
        </h2>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center bg-ink-deep hover:bg-charcoal text-canvas text-[16px] font-medium py-4 px-10 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          Get Started Now
        </Link>
      </section>
      
      <Footer />
    </div>
  );
}
