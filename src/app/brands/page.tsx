export default function BrandsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Brands</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Popular brands</h1>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {['ShopFront', 'DenimCo', 'SpeedRun', 'SoundMax', 'LeatherCraft', 'UrbanCart'].map((brand) => (
          <div key={brand} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-900">{brand}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
