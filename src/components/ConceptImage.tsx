type Scene =
  | 'hero'
  | 'earth'
  | 'industry'
  | 'amber'
  | 'fragment'
  | 'wood'
  | 'stone'
  | 'glass'
  | 'ceramic'
  | 'brass'
  | 'steel'
  | 'titanium'
  | 'knot'
  | 'packaging'
  | 'lifestyle'
const scenes: Record<
  Scene,
  { board: number; width: number; height: number; crop: [number, number, number, number] }
> = {
  hero: { board: 3, width: 1536, height: 1024, crop: [357, 0, 361, 346] },
  earth: { board: 3, width: 1536, height: 1024, crop: [39, 408, 223, 182] },
  industry: { board: 3, width: 1536, height: 1024, crop: [272, 408, 225, 182] },
  amber: { board: 3, width: 1536, height: 1024, crop: [507, 408, 225, 182] },
  fragment: { board: 3, width: 1536, height: 1024, crop: [742, 408, 225, 182] },
  wood: { board: 3, width: 1536, height: 1024, crop: [1095, 68, 94, 88] },
  stone: { board: 3, width: 1536, height: 1024, crop: [1203, 68, 95, 88] },
  glass: { board: 3, width: 1536, height: 1024, crop: [1311, 68, 96, 88] },
  ceramic: { board: 3, width: 1536, height: 1024, crop: [1419, 68, 95, 88] },
  brass: { board: 3, width: 1536, height: 1024, crop: [1095, 204, 94, 88] },
  steel: { board: 3, width: 1536, height: 1024, crop: [1203, 204, 95, 88] },
  titanium: { board: 3, width: 1536, height: 1024, crop: [1311, 204, 96, 88] },
  knot: { board: 3, width: 1536, height: 1024, crop: [1144, 678, 135, 219] },
  packaging: { board: 3, width: 1536, height: 1024, crop: [557, 727, 210, 169] },
  lifestyle: { board: 1, width: 1312, height: 1199, crop: [2, 798, 213, 175] },
}

export function ConceptImage({
  scene,
  alt,
  className = '',
}: {
  scene: Scene
  alt: string
  className?: string
}) {
  const asset = scenes[scene]
  return (
    <svg
      className={`concept-image ${className}`}
      viewBox={asset.crop.join(' ')}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
    >
      <image
        href={`/images/concept-${asset.board}.png`}
        width={asset.width}
        height={asset.height}
      />
    </svg>
  )
}
