import PhotoLibrary from './PhotoLibrary'
import { BackgroundPaths } from './BackgroundPaths'
import { AnimatedNav } from './AnimatedNav'

export default function App() {
  return (
    <>
      <AnimatedNav />
      <BackgroundPaths>
        <PhotoLibrary />
      </BackgroundPaths>
    </>
  )
}
