// Test cart functionality
const testCart = async () => {
    try {
        console.log('🧪 Testing cart functionality...');
        
        // Test adding an item to cart
        const addResponse = await fetch('http://localhost:5000/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: 'test_session_123',
                serviceId: 'basic-website',
                quantity: 1
            })
        });
        
        if (addResponse.ok) {
            const result = await addResponse.json();
            console.log('✅ Add to cart successful:', result);
        } else {
            console.log('❌ Add to cart failed:', await addResponse.text());
        }
        
        // Test getting cart
        const getResponse = await fetch('http://localhost:5000/cart?sessionId=test_session_123');
        if (getResponse.ok) {
            const cart = await getResponse.json();
            console.log('✅ Get cart successful:', cart);
        } else {
            console.log('❌ Get cart failed:', await getResponse.text());
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

testCart();
