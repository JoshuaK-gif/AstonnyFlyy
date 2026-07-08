async function testFetch() {
  const colls = ['Trending', 'Limited Edition'];
  
  for (const coll of colls) {
    console.log(`\nTesting collection: ${coll}`);
    const response = await fetch(`http://localhost:5000/api/products?collection=${encodeURIComponent(coll)}`);
    const products = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Found ${products.length} products:`, products.map(p => p.name));
  }
}

testFetch();
