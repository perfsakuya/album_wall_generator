import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const About = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <Layout>
      <div className={`max-w-4xl mx-auto px-4 py-8 transition-opacity duration-500 ease-in-out
                      ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 头部区域 */}
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg">image</span>
              </div>
            </div>

          {/* 内容区域 */}
          <div className="pt-16 px-8 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Album Wall Generator</h2>

            {/* 项目介绍 */}
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">项目介绍</h3>
                <p className="text-gray-600 leading-relaxed">
                  This is an Album Wall Generator, you can use it to generate a album wall.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About; 