import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, RoundedBox, MeshWobbleMaterial, Text, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

type Choice = 'rock' | 'paper' | 'scissors' | null
type Result = 'win' | 'lose' | 'tie' | null

// 3D Rock Component - smooth rounded boulder shape
function Rock({ position = [0, 0, 0], scale = 1, color = '#8B7355', isAnimating = false }: {
  position?: [number, number, number],
  scale?: number,
  color?: string,
  isAnimating?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    if (isAnimating && groupRef.current) {
      groupRef.current.rotation.y += delta * 2
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.8, 1]} />
        <MeshWobbleMaterial
          color={color}
          factor={isAnimating ? 0.3 : 0}
          speed={isAnimating ? 4 : 0}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0.4]} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[-0.4, -0.1, 0.3]} castShadow>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

// 3D Paper Component - flat folded paper shape
function Paper({ position = [0, 0, 0], scale = 1, color = '#F5F5DC', isAnimating = false }: {
  position?: [number, number, number],
  scale?: number,
  color?: string,
  isAnimating?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    if (isAnimating && groupRef.current) {
      groupRef.current.rotation.y += delta * 2
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <RoundedBox args={[1.4, 1.8, 0.05]} radius={0.02} castShadow>
        <MeshWobbleMaterial
          color={color}
          factor={isAnimating ? 0.2 : 0}
          speed={isAnimating ? 3 : 0}
          roughness={0.6}
          metalness={0}
        />
      </RoundedBox>
      {/* Folded corner */}
      <mesh position={[0.5, 0.7, 0.03]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.04]} />
        <meshStandardMaterial color="#E8E8D0" roughness={0.7} />
      </mesh>
    </group>
  )
}

// 3D Scissors Component - stylized scissors
function Scissors({ position = [0, 0, 0], scale = 1, color = '#C0C0C0', isAnimating = false }: {
  position?: [number, number, number],
  scale?: number,
  color?: string,
  isAnimating?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const blade1Ref = useRef<THREE.Group>(null!)
  const blade2Ref = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    if (isAnimating && groupRef.current) {
      groupRef.current.rotation.y += delta * 2
      if (blade1Ref.current && blade2Ref.current) {
        const angle = Math.sin(state.clock.elapsedTime * 8) * 0.15
        blade1Ref.current.rotation.z = angle
        blade2Ref.current.rotation.z = -angle
      }
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Blade 1 */}
      <group ref={blade1Ref} position={[0, 0, 0.05]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.15, 1.2, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Handle 1 */}
        <mesh position={[0.15, -0.4, 0]} castShadow>
          <torusGeometry args={[0.25, 0.08, 8, 16, Math.PI * 1.5]} />
          <meshStandardMaterial color="#FF6B6B" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
      {/* Blade 2 */}
      <group ref={blade2Ref} position={[0, 0, -0.05]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.15, 1.2, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Handle 2 */}
        <mesh position={[-0.15, -0.4, 0]} rotation={[0, Math.PI, 0]} castShadow>
          <torusGeometry args={[0.25, 0.08, 8, 16, Math.PI * 1.5]} />
          <meshStandardMaterial color="#FF6B6B" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
      {/* Pivot screw */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Display component that shows the choice
function ChoiceDisplay({ choice, side, isAnimating, result }: {
  choice: Choice,
  side: 'left' | 'right',
  isAnimating: boolean,
  result: Result
}) {
  const x = side === 'left' ? -2 : 2

  // Determine color based on result
  const getColor = () => {
    if (!result) {
      if (choice === 'rock') return '#A8927D'
      if (choice === 'paper') return '#FFF8DC'
      if (choice === 'scissors') return '#D4D4D4'
    }
    const isWinner = (side === 'left' && result === 'win') || (side === 'right' && result === 'lose')
    const isLoser = (side === 'left' && result === 'lose') || (side === 'right' && result === 'win')

    if (isWinner) return '#7CD992'
    if (isLoser) return '#FF8A80'
    return '#FFD54F' // tie
  }

  return (
    <Float
      speed={2}
      rotationIntensity={isAnimating ? 0.5 : 0.1}
      floatIntensity={isAnimating ? 0.5 : 0.3}
    >
      <group position={[x, 0.5, 0]}>
        {choice === 'rock' && <Rock scale={1} color={getColor()} isAnimating={isAnimating} />}
        {choice === 'paper' && <Paper scale={0.8} color={getColor()} isAnimating={isAnimating} />}
        {choice === 'scissors' && <Scissors scale={1} color={getColor()} isAnimating={isAnimating} />}
        {!choice && (
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#E0E0E0" transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    </Float>
  )
}

// VS Text in center
function VSText({ isAnimating }: { isAnimating: boolean }) {
  return (
    <Float speed={3} floatIntensity={0.2}>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.6}
        color="#FF6B6B"
        font="https://fonts.gstatic.com/s/fraunces/v31/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIctxqjDvTShUtWNg.woff"
        anchorX="center"
        anchorY="middle"
      >
        {isAnimating ? '?' : 'VS'}
      </Text>
    </Float>
  )
}

// Scene component
function Scene({ playerChoice, computerChoice, isAnimating, result }: {
  playerChoice: Choice,
  computerChoice: Choice,
  isAnimating: boolean,
  result: Result
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFE4B5" />

      <ChoiceDisplay choice={playerChoice} side="left" isAnimating={isAnimating} result={result} />
      <VSText isAnimating={isAnimating} />
      <ChoiceDisplay choice={computerChoice} side="right" isAnimating={isAnimating} result={result} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={12}
        blur={2}
        far={4}
        color="#9D8B7A"
      />

      <Environment preset="apartment" />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={12}
      />
    </>
  )
}

// Main App Component
export default function App() {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [scores, setScores] = useState({ player: 0, computer: 0 })
  const [showResult, setShowResult] = useState(false)

  const choices: Choice[] = ['rock', 'paper', 'scissors']

  const getComputerChoice = (): Choice => {
    return choices[Math.floor(Math.random() * 3)]
  }

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return 'tie'
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win'
    }
    return 'lose'
  }

  const handleChoice = (choice: Choice) => {
    if (isAnimating) return

    setIsAnimating(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)
    setShowResult(false)

    // Simulate computer "thinking"
    setTimeout(() => {
      const compChoice = getComputerChoice()
      setComputerChoice(compChoice)
      const gameResult = determineWinner(choice, compChoice)
      setResult(gameResult)
      setIsAnimating(false)
      setShowResult(true)

      if (gameResult === 'win') {
        setScores(prev => ({ ...prev, player: prev.player + 1 }))
      } else if (gameResult === 'lose') {
        setScores(prev => ({ ...prev, computer: prev.computer + 1 }))
      }
    }, 1500)
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
    setShowResult(false)
    setScores({ player: 0, computer: 0 })
  }

  const getResultMessage = () => {
    if (!showResult || !result) return ''
    if (result === 'win') return 'You Win!'
    if (result === 'lose') return 'Computer Wins!'
    return "It's a Tie!"
  }

  const getResultColor = () => {
    if (result === 'win') return 'text-emerald-500'
    if (result === 'lose') return 'text-rose-400'
    return 'text-amber-400'
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(145deg, #FFF9F0 0%, #FFF5E6 30%, #FFEFD5 70%, #FFE4C4 100%)'
    }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 md:w-64 md:h-64 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #FFB6C1 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 right-20 w-40 h-40 md:w-80 md:h-80 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #87CEEB 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 md:w-48 md:h-48 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #98FB98 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <h1 className="font-display text-2xl md:text-4xl tracking-tight"
              style={{ color: '#5D4E3C', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>
            Rock Paper Scissors
          </h1>

          {/* Score Display */}
          <div className="flex items-center gap-4 md:gap-8 bg-white/60 backdrop-blur-sm rounded-2xl px-4 md:px-8 py-2 md:py-3 shadow-lg border border-white/40">
            <div className="text-center">
              <p className="text-xs md:text-sm uppercase tracking-widest opacity-60" style={{ fontFamily: 'Outfit, sans-serif' }}>You</p>
              <p className="text-2xl md:text-4xl font-bold" style={{ color: '#FF6B6B', fontFamily: 'Fraunces, serif' }}>{scores.player}</p>
            </div>
            <div className="w-px h-10 md:h-12 bg-black/10" />
            <div className="text-center">
              <p className="text-xs md:text-sm uppercase tracking-widest opacity-60" style={{ fontFamily: 'Outfit, sans-serif' }}>CPU</p>
              <p className="text-2xl md:text-4xl font-bold" style={{ color: '#6B8EFF', fontFamily: 'Fraunces, serif' }}>{scores.computer}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 2, 8], fov: 45 }}
          shadows
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Scene
              playerChoice={playerChoice}
              computerChoice={computerChoice}
              isAnimating={isAnimating}
              result={result}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Result Message */}
      {showResult && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className={`text-3xl md:text-5xl font-bold ${getResultColor()} animate-bounce`}
               style={{ fontFamily: 'Fraunces, serif', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {getResultMessage()}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-20 md:bottom-24 left-0 right-0 z-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Labels */}
          <div className="flex justify-between mb-4 md:mb-6 px-2">
            <span className="text-xs md:text-sm uppercase tracking-widest font-medium"
                  style={{ color: '#FF6B6B', fontFamily: 'Outfit, sans-serif' }}>
              Player
            </span>
            <span className="text-xs md:text-sm uppercase tracking-widest font-medium"
                  style={{ color: '#6B8EFF', fontFamily: 'Outfit, sans-serif' }}>
              Computer
            </span>
          </div>

          {/* Choice Buttons */}
          <div className="flex justify-center gap-3 md:gap-6">
            {(['rock', 'paper', 'scissors'] as const).map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                disabled={isAnimating}
                className={`
                  group relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl
                  bg-white/80 backdrop-blur-sm
                  shadow-lg hover:shadow-xl
                  border-2 border-transparent
                  transition-all duration-300 ease-out
                  hover:scale-110 hover:-translate-y-2
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
                  ${playerChoice === choice ? 'ring-4 ring-rose-300 border-rose-300' : 'hover:border-rose-200'}
                `}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span className="text-3xl md:text-5xl">
                  {choice === 'rock' && '🪨'}
                  {choice === 'paper' && '📄'}
                  {choice === 'scissors' && '✂️'}
                </span>
                <span className="absolute -bottom-5 md:-bottom-6 left-1/2 -translate-x-1/2 text-xs md:text-sm capitalize font-medium opacity-70 whitespace-nowrap">
                  {choice}
                </span>
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <div className="flex justify-center mt-10 md:mt-12">
            <button
              onClick={resetGame}
              className="px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-base font-medium
                       bg-white/60 backdrop-blur-sm border border-white/40
                       hover:bg-white/80 transition-all duration-300
                       shadow-md hover:shadow-lg"
              style={{ color: '#5D4E3C', fontFamily: 'Outfit, sans-serif' }}
            >
              Reset Game
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <p className="text-xs opacity-40" style={{ color: '#5D4E3C', fontFamily: 'Outfit, sans-serif' }}>
          Requested by @PauliusX · Built by @clonkbot
        </p>
      </footer>
    </div>
  )
}
