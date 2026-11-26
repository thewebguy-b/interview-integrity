import React, { Suspense, lazy } from 'react';

interface ShaderBackgroundProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const LazyShaderCanvas = lazy(async () => {
  const mod = await import('@shadergradient/react');
  const { ShaderGradientCanvas, ShaderGradient } = mod;

  function HaloShader() {
    return (
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        pixelDensity={1}
        fov={45}
        pointerEvents="none"
        lazyLoad={true}
      >
        <ShaderGradient
          animate="on"
          brightness={1.2}
          cAzimuthAngle={180}
          cDistance={3.6}
          cPolarAngle={90}
          cameraZoom={1}
          color1="#ff5005"
          color2="#dbba95"
          color3="#d0bce1"
          envPreset="city"
          grain="off"
          lightType="3d"
          positionX={-1.4}
          positionY={0}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          shader="defaults"
          type="plane"
          uAmplitude={1}
          uDensity={1.3}
          uFrequency={5.5}
          uSpeed={0.4}
          uStrength={4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>
    );
  }

  return { default: HaloShader };
});

class ShaderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    console.warn('[ShaderBackground] Fallback to CSS gradient:', err);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function ShaderBackground({ children, style, className }: ShaderBackgroundProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #d0bce1 0%, #dbba95 45%, #ff5005 100%)',
        color: '#FFFFFF',
        ...style,
      }}
    >
      <ShaderErrorBoundary>
        <Suspense fallback={null}>
          <LazyShaderCanvas />
        </Suspense>
      </ShaderErrorBoundary>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
