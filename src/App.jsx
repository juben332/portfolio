import PhotoLibrary from './PhotoLibrary'
import { BackgroundPaths } from './BackgroundPaths'
import { AnimatedNav } from './AnimatedNav'
import About from './About'
import Contact from './Contact'

export default function App() {
  return (
    <div className="scroll-container">
      <AnimatedNav />

      <section id="home" className="scroll-section">
        <BackgroundPaths>
          <PhotoLibrary />
        </BackgroundPaths>
      </section>

      <section id="about" className="scroll-section-tall">
        <About />
      </section>

      <section id="contact" className="scroll-section">
        <Contact />
      </section>
    </div>
  )
}
