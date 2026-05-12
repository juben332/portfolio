import ShatterLoader from './ShatterLoader';

export default function About() {
  return (
    <ShatterLoader>
      <div style={{
        width: '100%', height: '100%',
        background: '#000 url("/BG-about.png") center center/cover no-repeat',
      }} />
    </ShatterLoader>
  );
}
