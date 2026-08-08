const axios = require('axios');
const fs = require('fs');

async function testPdf() {
  try {
    const res = await axios.get('http://localhost:5000/api/getAllHotels');
    const hotels = res.data.result;
    if (hotels.length === 0) {
      console.log('No hotels found');
      return;
    }
    const hotelId = hotels[0]._id;
    console.log('Testing PDF for hotel:', hotelId);

    const pdfRes = await axios.get(`http://localhost:5000/api/pdf/hotel/${hotelId}`, { responseType: 'arraybuffer' });
    fs.writeFileSync('test_hotel.pdf', pdfRes.data);
    console.log('Saved test_hotel.pdf, size:', pdfRes.data.length);
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response && e.response.data) {
       console.error('Response data:', e.response.data.toString('utf8'));
    }
  }
}

testPdf();
