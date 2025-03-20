"use client";
import React from "react";
import Generator from "../components/Generator";
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="relative">
      <nav>
        <Link href="/">主页</Link>
        <Link href="/about">关于</Link>
      </nav>
      <Generator />
    </div>
  );
};

export default HomePage;