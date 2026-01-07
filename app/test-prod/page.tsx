"use client";

import { useState, useRef, useEffect } from "react";
// 引用正式包 (NPM)
import { QxanDecoder } from "qxan-decoder-sdk";

export default function ProdPage() {
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isVideoMode, setIsVideoMode] = useState(true); // 默认视频模式
  const [inputUrl, setInputUrl] = useState("");
  
  // 保存当前输入源（File 或 URL），以便切换模式时重新触发完整解码
  const currentInputRef = useRef<File | string | null>(null);

  // 核心处理函数：重新触发完整解码流程
  const processInput = async (input: File | string, modeOverride?: boolean) => {
    try {
      // 这里的 mode 可能还没更新 state，所以允许传入 override
      const mode = modeOverride !== undefined ? modeOverride : isVideoMode;
      const expect = mode ? "video" : "image";
      
      // [Log] Start - 打印详细的调试信息
      console.group("🚀 [ProdPage] Process Input Started");
      console.log("Time:", new Date().toLocaleTimeString());
      if (input instanceof File) {
        console.log("Input: File", { name: input.name, size: input.size, type: input.type });
      } else {
        console.log("Input: URL", input);
      }
      console.log("Parameters:", { expect, mode, isVideoMode, modeOverride });

      setStatus(`Processing (PROD MODE) - Full Decode [expect=${expect}]...`);
      setResult(null); 

      // 保存输入源
      currentInputRef.current = input;

      const res = await QxanDecoder.decode(input, {
        expect,
        maxFrames: 4,
        onProgress: (msg: string) => {
            console.log(`[Progress] ${msg}`);
            setStatus(msg);
        },
      });
      
      // [Log] Success
      console.log("✅ Decode Result:", res);
      console.groupEnd();

      setResult(res);
      setStatus("Done!");
    } catch (err: any) {
      // [Log] Error
      console.error("❌ Process Input Failed:", err);
      console.groupEnd();

      setStatus("Error: " + err.message);
    }
  };

  // 处理文件上传
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processInput(file);
  };

  // 处理 URL
  const handleUrl = () => {
    if (inputUrl) processInput(inputUrl);
  };

  // 处理模式切换：重新触发完整流程
  const handleModeSwitch = (newMode: boolean) => {
    setIsVideoMode(newMode);
    // 如果当前有输入源，立即使用新模式重新跑一遍
    if (currentInputRef.current) {
      processInput(currentInputRef.current, newMode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🚀 SDK Prod Test
            <span className="text-xs bg-blue-800 px-2 py-1 rounded text-blue-100">NPM Package</span>
          </h1>
          <p className="opacity-90 mt-1">Testing installed package from npm registry</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Mode Switch */}
            <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="block font-medium text-gray-700 mb-2">Output Mode (Triggers Re-decode):</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="mode" 
                    checked={isVideoMode} 
                    onChange={() => handleModeSwitch(true)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span>Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="mode" 
                    checked={!isVideoMode} 
                    onChange={() => handleModeSwitch(false)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span>Frames</span>
                </label>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative flex flex-col justify-center min-h-[120px]">
              <input 
                type="file" 
                onChange={handleFile} 
                accept="image/png" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-blue-600 font-medium">Upload File</div>
              <div className="text-xs text-gray-400 mt-1">Click or Drag .png</div>
            </div>

            {/* URL Input */}
            <div className="border border-gray-300 rounded-xl p-6 flex flex-col justify-center gap-2">
              <label className="text-sm font-medium text-gray-700">Or Input URL:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleUrl}
                  disabled={!inputUrl}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          {status && (
            <div className={`p-4 rounded-lg text-sm font-mono break-all ${status.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
              {status}
            </div>
          )}

          {/* Results Area */}
          {result && (
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-lg font-bold">Result Output</h2>
              
              {/* Metadata */}
              {result.metadata && (
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded border">
                  <div><span className="text-gray-500">Duration:</span> {result.metadata.duration}s</div>
                  <div><span className="text-gray-500">Size:</span> {result.metadata.width}x{result.metadata.height}</div>
                </div>
              )}

              {/* Video Player */}
              {result.videoUrl && isVideoMode && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-500">Extracted Video</h3>
                  <video src={result.videoUrl} controls className="w-full rounded-lg shadow-md bg-black max-h-[500px]" />
                </div>
              )}

              {/* Frames Grid */}
              {result.frames && result.frames.length > 0 && !isVideoMode && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-500">Extracted Frames ({result.frames.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.frames.map((url: string, idx: number) => (
                      <div key={idx} className="aspect-video bg-gray-200 rounded overflow-hidden shadow-sm border">
                        <img src={url} alt={`Frame ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <details>
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View Raw JSON</summary>
                <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
