import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Image from 'next/image';

const About = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <Layout>
      <div className={`max-w-4xl mx-auto px-4 py-8 transition-opacity duration-500 ease-in-out
                      ${mounted ? 'opacity-100' : 'opacity-0'} flex`}>

        <div className="w-1/2 pr-6 border-r border-gray-300">
          <div className="flex flex-col items-center">
            <Image
              src="/avatar.jpeg"
              alt="个人图像"
              className="w-56 h-56 rounded-lg shadow-lg mb-6"
              width={250}
              height={250}
            />
            <p className="text-gray-600 leading-relaxed mb-4 text-lg">
              HANDLED WITH LOVE BY ME.
            </p>
            <a href="https://blog.perfsky.online" className="text-blue-500 hover:underline text-lg">
              我的博客
            </a>
          </div>
        </div>

        <div className="w-1/2 pl-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Album Wall Generator</h2>
          <div className="space-y-6">
            <section>
              <p className="text-gray-600 leading-relaxed text-lg">
                一个调用Spotify API并生成可自定义的照片墙的demo网站。
              </p>
            </section>
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">功能</h3>
              <ol className="list-disc list-inside text-gray-600 text-lg">
                <li>调用Spotify API获取歌单</li>
                <li>自定义专辑位置和大小</li>
                <li>自定义背景</li>
              </ol>
            </section>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default About; 