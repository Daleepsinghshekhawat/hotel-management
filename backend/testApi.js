const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/getCoupons');
    console.log(`Status: ${res.status}`);
    console.log(`Total Coupons Returned: ${res.data.coupons.length}`);
    res.data.coupons.forEach(c => {
      const h = c.hotel ? c.hotel.hotelName : 'No Hotel';
      console.log(`- ${c.couponCode} | Hotel: ${h} | Admin: ${c.adminEmail}`);
    });
  } catch (err) {
    console.error(err.message);
  }
}

test();
