document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connect-button');
    if (connectButton) {
      connectButton.addEventListener('click', async event => {
        // Check for the `ethereum` object
        console.log('ethereum object:', window.ethereum);
        if (typeof window.ethereum !== 'undefined') {
          try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            console.log('Connected account:', account);
            window.location.href = '/index/index.html'; // Redirect to the main page after connection
          } catch (error) {
            console.error('Error connecting to MetaMask', error);
          }
        } else {
          alert('MetaMask is not installed. Please install it to use this feature.');
        }
      });
    }
  });
  