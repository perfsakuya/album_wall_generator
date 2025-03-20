"use client";
import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '@fortawesome/fontawesome-free/css/all.min.css';

// TODO: 增加顶部拖拽
// 拖拽功能
const DropCell = ({ x, y, onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'album',
    drop: (item) => onDrop(item, { x, y }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`w-[150px] h-[150px] border-2 border-dashed 
                  ${isOver ? 'border-green-500 bg-green-50' : 'border-gray-400'}
                  ${children ? 'border-none' : ''}`}
    >
      {children}
    </div>
  );
};

// 底栏组件
const AlbumItem = ({ album, index }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'album',
    item: { ...album, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`relative aspect-square overflow-hidden shadow-lg cursor-move flex-shrink-0
        ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{
        width: '150px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
      }}
    >
      <img
        src={album.image}
        alt={album.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md opacity-0 
                    hover:opacity-100 transition-opacity duration-500
                    flex items-center justify-center p-2">
        <p className="text-gray-900 text-center text-sm font-bold">
          {album.name.length > 25 ? album.name.substring(0, 25) + '...' : album.name}
          <br />
          <span className="text-xs text-gray-600">{album.artist}</span>
        </p>
      </div>
    </div>
  );
};

const SpotifyAlbumWall = () => {
  // API部分
  const [token, setToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState("https://open.spotify.com/playlist/2KXw6sx8bGRqZzKI4ASZhQ");

  // 页面部分
  const [showSearch, setShowSearch] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [placedAlbums, setPlacedAlbums] = useState({});
  const [showGrid, setShowGrid] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 参数设置
  const [gridRows, setGridRows] = useState(2);
  const [gridCols, setGridCols] = useState(3);
  const [gridOffsetX, setGridOffsetX] = useState(0);
  const [gridOffsetY, setGridOffsetY] = useState(100);

  // 动态字符串展示
  const [displayText, setDisplayText] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  // 在 SpotifyAlbumWall 组件中添加状态
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setShowSearch(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const messages = ["拉取你的个人歌单", "客制化你的专辑墙", "导出你的作品"];
    const currentMessage = messages[messageIndex];
    let timer;

    if (isWaiting) {
      timer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, 1500);
    } else if (isDeleting) {
      // 删除字符
      timer = setTimeout(() => {
        setDisplayText(currentMessage.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setMessageIndex((messageIndex + 1) % messages.length);
        }
      }, 50);
    } else {
      // 添加字符
      timer = setTimeout(() => {
        setDisplayText(currentMessage.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex + 1 === currentMessage.length) {
          setIsWaiting(true); // 完全显示后进入等待状态
        }
      }, 150);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, messageIndex, isWaiting]);

  const fetchToken = async () => {
    try {
      const response = await fetch("https://powerful-monkey-comic.ngrok-free.app/api/token", {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": 114514,
        }
      });
      // console.log("fetchToken response", response);
      const data = await response.json();
      if (response.ok && !data.error) {
        setToken(data.access_token);
        return data.access_token;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error fetching token:", error);
      return null;
    }
  };

  const fetchPlaylist = async () => {
    setIsLoading(true);
    setShowSearch(false);

    let currentToken = token;
    if (!currentToken) {
      currentToken = await fetchToken();
      if (!currentToken) {
        setIsLoading(false);
        setShowSearch(true);
        return;
      }
    }
    if (!playlistUrl) {
      setIsLoading(false);
      setShowSearch(true);
      return;
    }
    const playlistId = playlistUrl.match(/playlist\/(\w+)/)?.[1];
    if (!playlistId) {
      alert("Invalid playlist URL");
      setIsLoading(false);
      setShowSearch(true);
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      const data = await response.json();

      const uniqueAlbums = new Map();
      data.tracks.items.forEach((item) => {
        const album = item.track.album;
        if (!uniqueAlbums.has(album.id)) {
          uniqueAlbums.set(album.id, {
            name: album.name,
            image: album.images[0]?.url,
            artist: album.artists[0]?.name
          });
        }
      });

      setAlbums(Array.from(uniqueAlbums.values()));
      // 在数据加载完成后，延迟显示网格
      setTimeout(() => {
        setShowGrid(true);
      }, 500); // 500ms 的延迟，可以根据需要调整
    } catch (error) {
      console.error("Error fetching playlist:", error);
      alert("获取歌单失败，请重试");
      setShowSearch(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理专辑放置
  const handleDrop = (album, position) => {
    const key = `${position.x}-${position.y}`;

    // 如果专辑已经放置在其他位置，先移除
    if (album.isPlaced) {
      const oldKey = `${album.position.x}-${album.position.y}`;
      setPlacedAlbums(prev => {
        const newAlbums = { ...prev };
        delete newAlbums[oldKey];
        return newAlbums;
      });
    }

    // 放置到新位置
    setPlacedAlbums(prev => ({
      ...prev,
      [key]: album
    }));
  };

  // 生成网格
  const generateGrid = () => {
    const grid = [];

    for (let y = 0; y < gridRows; y++) {
      const row = [];
      for (let x = 0; x < gridCols; x++) {
        const key = `${x}-${y}`;
        row.push(
          <DropCell
            key={key}
            x={x}
            y={y}
            onDrop={handleDrop}
            album={placedAlbums[key]}
          >
            {placedAlbums[key] && (
              <div className="w-full h-full cursor-move "
                style={{
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
                }}>
                <img
                  src={placedAlbums[key].image}
                  alt={placedAlbums[key].name}
                  className="w-full h-full object-cover "
                />
              </div>
            )}
          </DropCell>
        );
      }
      grid.push(
        <div key={y} className="flex gap-4">
          {row}
        </div>
      );
    }
    return grid;
  };

  // 添加重置函数
  const handleReset = () => {
    setPlacedAlbums({});
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-white flex flex-col">
        {/* 顶栏 */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50
                        flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-500">
              <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Album Wall Generator</h1>
          </div>
          <button
            onClick={() => setShowAbout(true)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 
                     transition-colors duration-200"
          >
            关于
          </button>
        </div>

        {/* 欢迎界面 */}
        <div className={`fixed inset-0 flex flex-col items-center justify-center bg-white
                        transition-all duration-200 ease-in-out
                        ${showWelcome ? 'opacity-100 z-20' : 'opacity-0 -z-10'}`}>
          <div className="text-center">
            <div className="w-24 h-24 mb-6 mx-auto">
              <svg viewBox="0 0 24 24" className={`w-full h-full text-green-500 transition-transform duration-200
                                                 ${showWelcome ? 'scale-100' : 'scale-90'}`}>
                <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <h1 className={`text-5xl font-bold text-gray-900 mb-4 transition-all duration-200
                           ${showWelcome ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
              Album Wall Generator
            </h1>
            <p className={`text-gray-600 text-lg transition-all duration-200 delay-300
                          ${showWelcome ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
              打造你的个人专辑墙
            </p>
          </div>
        </div>

        {/* 搜索模块 */}
        <div className={`fixed inset-0 flex items-center justify-center transition-opacity duration-500 
                        ${showSearch ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
          <div className="w-full max-w-md px-4">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
              {displayText}
              <span className="blinking-cursor">_</span>
            </h1>
            <div className="flex flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="输入 Spotify 歌单链接"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="flex-1 px-6 py-3 rounded-full border border-gray-300 bg-white text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         transition-all duration-300 ease-in-out hover:shadow-lg shadow-md"
              />
              <button
                onClick={fetchPlaylist}
                disabled={isLoading}
                className="whitespace-nowrap px-8 py-3 rounded-full bg-green-500 text-white font-medium
                         shadow-md hover:shadow-lg hover:bg-green-600 
                         transition-all duration-300 ease-in-out active:scale-90
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                GO!
              </button>
            </div>
          </div>
        </div>

        {/* 加载动画 */}
        <div className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-1000
                        ${isLoading ? 'opacity-100 z-30' : 'opacity-0 -z-10'}`}>
          <p className="text-gray-900 text-2xl font-medium animate-pulse">
            正在获取专辑信息...
          </p>
        </div>

        {/* 背景 */}
        {albums.length > 0 && !isLoading && (
          <div className={`fixed inset-0 transition-opacity duration-300 ease-in-out
                          ${showGrid ? 'opacity-100' : 'opacity-0'}`}
            style={{
              background: `
                   linear-gradient(to right, rgba(160, 210, 235, 0.5) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(160, 210, 235, 0.5) 1px, transparent 1px),
                   repeating-linear-gradient(
                     to right,
                     transparent,
                     transparent 49px,
                     rgba(160, 210, 235, 0.5) 50px
                   ),
                   repeating-linear-gradient(
                     to bottom,
                     transparent,
                     transparent 49px,
                     rgba(160, 210, 235, 0.5) 50px
                   )
                 `,
              backgroundSize: '50px 50px',
              zIndex: 0
            }}
          />
        )}

        {/* dnd展示区域 */}
        {albums.length > 0 && !isLoading && (
          <div className={`flex-1 p-8 transition-all duration-300 ease-in-out relative
                          ${showGrid ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: `translate(${gridOffsetX}px, ${gridOffsetY}px)`,
              zIndex: 1
            }}>
            <div className="flex flex-col gap-4 items-center">
              {generateGrid()}
            </div>
          </div>
        )}

        {albums.length > 0 && (
          <div className={`fixed bottom-0 left-0 right-0 bg-transparent 
                          transition-all duration-500 ease-in-out
                          ${showGrid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
            style={{ zIndex: 2 }}>
            <div className="max-w-[1800px] mx-auto">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 py-8 pl-4 pr-4">
                  {albums.map((album, index) => (
                    <AlbumItem
                      key={index}
                      album={album}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 重置按钮 */}
        {albums.length > 0 && !isLoading && (
          <div className={`fixed bottom-52 right-20 z-10 transition-opacity duration-300 ease-in-out
                          ${showGrid ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={handleReset}
              className="px-5 py-4 rounded-full bg-green-500 text-white font-medium
                       shadow-lg hover:shadow-xl hover:bg-green-600 
                       transition-all duration-300 ease-in-out active:scale-90"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        )}

        {/* 设置按钮 */}
        {albums.length > 0 && !isLoading && (
          <div className={`fixed bottom-52 right-4 z-10 transition-opacity duration-300 ease-in-out
                          ${showGrid ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-5 py-4 rounded-full bg-green-500 text-white font-medium
                       shadow-lg hover:shadow-xl hover:bg-green-600 
                       transition-all duration-300 ease-in-out active:scale-90"
            >
              <i className="fas fa-cog"></i>
            </button>
          </div>
        )}

        {/* 设置面板 */}
        {showSettings && (
          <div className={`fixed bottom-72 right-4 bg-white rounded-lg shadow-xl p-6 z-50 w-80
                          transition-opacity duration-300 ease-in-out
                          ${showSettings ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <h3 className="text-lg font-bold mb-4">网格设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">行数</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={gridRows}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                    setGridRows(value);
                  }}
                  onBlur={(e) => {
                    // 在失焦时检查是否为空或无效值
                    const value = e.target.value === '' ? 2 : parseInt(e.target.value);
                    setGridRows(value);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">列数</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={gridCols}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                    setGridCols(value);
                  }}
                  onBlur={(e) => {
                    // 在失焦时检查是否为空或无效值
                    const value = e.target.value === '' ? 3 : parseInt(e.target.value);
                    setGridCols(value);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  水平偏移 (px): {gridOffsetX}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-400"
                    max="400"
                    step="5"
                    value={gridOffsetX}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setGridOffsetX(value);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                              accent-green-500 hover:accent-green-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  垂直偏移 (px): {gridOffsetY}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-200"
                    max="400"
                    step="5"
                    value={gridOffsetY}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setGridOffsetY(value);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                              accent-green-500 hover:accent-green-600"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg
                       hover:bg-green-600 transition-colors duration-300"
            >
              关闭
            </button>
          </div>
        )}

        {/* 关于页面 */}
        {showAbout && (
          <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center
                          transition-opacity duration-300
                          ${showAbout ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 relative
                          transform transition-all duration-300 ease-in-out">
              <button
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600
                         transition-colors duration-200"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">关于</h2>

              {/* 头像占位 */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-lg bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">image</span>
                </div>
              </div>

              <div className="prose text-gray-600">
                <ul className="list-disc list-inside mb-4">
                  <li>从 Spotify 歌单导入专辑封面</li>
                  <li>通过拖放方式创建专辑墙</li>
                  <li>自定义参数和布局</li>
                  <li>TODO: 增加背景、导出图片</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </DndProvider>
  );
};

export default SpotifyAlbumWall;