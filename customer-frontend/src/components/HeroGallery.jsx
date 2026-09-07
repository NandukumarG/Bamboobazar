import { useState } from 'react'
import hero from '../assets/hero-bg.webp'
import lighting from '../assets/aboutus-2.webp'
import forest from '../assets/aboutus-1.webp'

const SCENES = [
  { image: hero, label: 'Quiet corners', heading: 'A slower way to live.', alt: 'Bamboo console and sculptural vase in a sunlit interior' },
  { image: lighting, label: 'Warm spaces', heading: 'Let the warmth in.', alt: 'Woven pendant light above a bamboo console' },
  { image: forest, label: 'Natural roots', heading: 'It begins with nature.', alt: 'Fresh bamboo leaves and stems in the sunlight' },
]
export default function HeroGallery() {
  const [active, setActive] = useState(0)
  const scene = SCENES[active]
  return <div className="hero__media hero-gallery">
    <img key={scene.image} className="hero__photograph" src={scene.image} alt={scene.alt} fetchPriority={active === 0 ? 'high' : 'auto'} />
    <div className="hero-gallery__top"><span>THE ART OF NATURAL LIVING</span><span>0{active + 1} / 03</span></div>
    <a href="#material-studio" className="hero__floating-note"><span aria-hidden="true">&#8599;</span><div>Make it your own<small>Enter the interactive studio</small></div></a>
    <div className="hero__image-label" aria-live="polite"><span>{scene.heading}</span><small>{scene.label.toUpperCase()}</small></div>
    <div className="hero-scene-picker" role="group" aria-label="Choose an interior scene">{SCENES.map((item,index) => <button key={item.label} aria-label={`Show ${item.label}`} aria-pressed={active === index} onClick={() => setActive(index)}><span>0{index + 1}</span>{item.label}</button>)}</div>
  </div>
}
