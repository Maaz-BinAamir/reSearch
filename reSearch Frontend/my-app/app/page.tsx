import SearchComponent from '../components/SearchComponent'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold text-primary animate-fade-in">reSearch</h1>
      <p className="mb-8 text-xl text-center animate-fade-in animation-delay-200">
        Your gateway to scholarly articles
      </p>
      <SearchComponent />
    </main>
  )
}

