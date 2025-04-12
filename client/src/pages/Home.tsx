import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import ProjectsSection from '@/components/home/ProjectsSection';
import SkillsSection from '@/components/home/SkillsSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import ResumeUploadSection from '@/components/home/ResumeUploadSection';
import ContactSection from '@/components/home/ContactSection';
import ChatWidget from '@/components/home/ChatWidget';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <ProjectsSection />
        <SkillsSection />
        <ReviewsSection />
        <ResumeUploadSection />
        <ContactSection />
        <ChatWidget />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
