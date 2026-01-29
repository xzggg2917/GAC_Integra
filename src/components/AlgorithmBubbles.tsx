import React, { useEffect, useRef, useState } from 'react'
import { dimensions } from '../data/algorithms'
import './AlgorithmBubbles.css'

interface Bubble {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const AlgorithmBubbles: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const animationFrameRef = useRef<number>();

  // 生成随机颜色（水珠风格）
  const generateColor = () => {
    const colors = [
      'rgba(100, 200, 255, 0.8)',  // 浅蓝
      'rgba(120, 180, 255, 0.8)',  // 天蓝
      'rgba(80, 220, 255, 0.8)',   // 青蓝
      'rgba(150, 190, 255, 0.8)',  // 紫蓝
      'rgba(90, 210, 240, 0.8)',   // 青色
      'rgba(110, 200, 250, 0.8)',  // 亮蓝
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 初始化气泡
  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const initialBubbles: Bubble[] = dimensions.map((algo: any) => {
      const radius = 50 + Math.random() * 30;
      return {
        id: algo.id,
        name: algo.name,
        x: Math.random() * (width - radius * 2) + radius,
        y: Math.random() * (height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius,
        color: generateColor()
      };
    });

    setBubbles(initialBubbles);
  }, []);

  // 动画循环
  useEffect(() => {
    if (bubbles.length === 0 || !canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const animate = () => {
      setBubbles(prevBubbles => {
        return prevBubbles.map(bubble => {
          let { x, y, vx, vy, radius } = bubble;

          // 更新位置
          x += vx;
          y += vy;

          // 边界碰撞检测
          if (x - radius < 0 || x + radius > width) {
            vx = -vx;
            x = x - radius < 0 ? radius : width - radius;
          }
          if (y - radius < 0 || y + radius > height) {
            vy = -vy;
            y = y - radius < 0 ? radius : height - radius;
          }

          return { ...bubble, x, y, vx, vy };
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bubbles.length]);

  return (
    <div className="bubbles-container" ref={canvasRef}>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            left: `${bubble.x - bubble.radius}px`,
            top: `${bubble.y - bubble.radius}px`,
            width: `${bubble.radius * 2}px`,
            height: `${bubble.radius * 2}px`,
            background: bubble.color,
          }}
        >
          <div className="bubble-content">
            <span className="bubble-name">{bubble.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlgorithmBubbles;
