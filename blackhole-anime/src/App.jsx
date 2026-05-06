import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import './App.css'

function App() {
  const blackHoleRef = useRef(null)
  const accretionDiskRef = useRef(null)
  const particlesRef = useRef(null)
  const eventHorizonRef = useRef(null)
  const photonSphereRef = useRef(null)

  useEffect(() => {
    // Animasi Lubang Hitam (Black Hole)
    animate(blackHoleRef.current, {
      scale: [0.8, 1.2, 0.8],
      duration: 4000,
      easing: 'easeInOutSine',
      loop: true
    })

    // Animasi Cakram Akresi (Accretion Disk)
    animate(accretionDiskRef.current, {
      rotate: '360deg',
      duration: 8000,
      easing: 'linear',
      loop: true
    })

    animate(accretionDiskRef.current.querySelectorAll('.disk-ring'), {
      opacity: [0.3, 0.8, 0.3],
      delay: stagger(200),
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true
    })

    // Animasi Partikel (Matter being pulled in)
    const createParticle = () => {
      if (!particlesRef.current) return

      const particle = document.createElement('div')
      particle.className = 'particle'
      particlesRef.current.appendChild(particle)

      const angle = Math.random() * Math.PI * 2
      const distance = 200 + Math.random() * 150
      const startX = Math.cos(angle) * distance
      const startY = Math.sin(angle) * distance

      animate(particle, {
        translateX: [startX, 0],
        translateY: [startY, 0],
        opacity: [1, 0],
        scale: [1, 0.5],
        duration: 2000 + Math.random() * 1000,
        easing: 'easeInQuad',
        complete: () => {
          particle.remove()
        }
      })
    }

    const particleInterval = setInterval(createParticle, 100)

    // Animasi Event Horizon
    animate(eventHorizonRef.current, {
      boxShadow: [
        '0 0 20px 10px rgba(0, 0, 0, 0.8)',
        '0 0 40px 20px rgba(0, 0, 0, 0.9)',
        '0 0 20px 10px rgba(0, 0, 0, 0.8)'
      ],
      duration: 3000,
      easing: 'easeInOutSine',
      loop: true
    })

    // Animasi Photon Sphere
    animate(photonSphereRef.current, {
      rotate: '-360deg',
      duration: 6000,
      easing: 'linear',
      loop: true
    })

    animate(photonSphereRef.current, {
      opacity: [0.2, 0.6, 0.2],
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true
    })

    return () => {
      clearInterval(particleInterval)
    }
  }, [])

  return (
    <div className="app">
      <div className="stars"></div>
      
      <header className="header">
        <h1>LUBANG HITAM</h1>
        <p className="subtitle">Black Hole - Fenomena Ter ekstrem di Alam Semesta</p>
      </header>

      <main className="content">
        <div className="animation-container">
          <div className="black-hole" ref={blackHoleRef}>
            <div className="event-horizon" ref={eventHorizonRef}></div>
            <div className="photon-sphere" ref={photonSphereRef}></div>
            <div className="accretion-disk" ref={accretionDiskRef}>
              <div className="disk-ring ring-1"></div>
              <div className="disk-ring ring-2"></div>
              <div className="disk-ring ring-3"></div>
            </div>
            <div className="particles" ref={particlesRef}></div>
          </div>
        </div>

        <section className="info-section">
          <div className="info-card">
            <h2>Apa itu Lubang Hitam?</h2>
            <p>
              Lubang hitam adalah wilayah di ruang-waktu di mana gravitasi begitu kuat 
              sehingga tidak ada apa pun—bahkan cahaya—yang dapat lolos darinya. 
              Batas di mana tidak ada yang bisa kembali disebut <strong>event horizon</strong>.
            </p>
          </div>

          <div className="info-card">
            <h2>Bagaimana Terbentuk?</h2>
            <p>
              Lubang hitam terbentuk ketika bintang masif kehabisan bahan bakar nuklir 
              dan runtuh akibat gravitasinya sendiri. Inti bintang yang sangat padat 
              ini menciptakan singularitas dengan gravitasi tak terbatas.
            </p>
          </div>

          <div className="info-card">
            <h2>Cakram Akresi</h2>
            <p>
              Materi yang ditarik oleh lubang hitam membentuk cakram akresi yang berputar 
              sangat cepat. Gesekan dalam cakram ini menghasilkan panas ekstrem dan 
              memancarkan sinar-X serta radiasi lainnya.
            </p>
          </div>

          <div className="info-card">
            <h2>Fakta Menarik</h2>
            <ul>
              <li>Lubang hitam supermasif terdapat di pusat galaksi kita, Bima Sakti</li>
              <li>Waktu berjalan lebih lambat di dekat lubang hitam (dilatasi waktu)</li>
              <li>Lubang hitam dapat memiliki massa jutaan hingga miliaran kali Matahari</li>
              <li>Stephen Hawking memprediksi lubang hitam memancarkan radiasi (Radiasi Hawking)</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Dibuat dengan React & Anime.js | Eksplorasi Misteri Alam Semesta</p>
      </footer>
    </div>
  )
}

export default App
