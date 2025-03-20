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
          <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg">头像</span>
              </div>
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
                  Album Wall Generator 是一个专门用于创建和定制化专辑墙的工具。通过简单的拖放操作，
                  用户可以将自己喜爱的专辑封面排列成独特的墙面展示。
                </p>
              </section>

              {/* 主要功能 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">主要功能</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    从 Spotify 歌单导入专辑封面
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    通过拖放方式创建专辑墙
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    自定义网格布局和位置
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    实时预览效果
                  </li>
                </ul>
              </section>

              {/* 技术栈 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">技术栈</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'Tailwind CSS', 'React DnD', 'Spotify API'].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              {/* 未来计划 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">开发计划</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <i className="fas fa-clock text-blue-500 mr-2"></i>
                    支持导出高清图片
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-clock text-blue-500 mr-2"></i>
                    增加更多背景样式
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-clock text-blue-500 mr-2"></i>
                    支持保存和分享作品
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About; 