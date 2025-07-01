// const API_URL = "https://social-roses-stay.loca.lt/"
const API_URL = "http://192.168.8.102:3000"

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connect-button');

  if (connectButton) {
    connectButton.addEventListener('click', async () => {
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install it to use this feature.');
        return;
      }

      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        console.log('Connected account:', account);

        const loginResponse = await fetch(`${API_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey: account })
        });

        if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.status}`);

        const loginData = await loginResponse.json();
        console.log('Login data:', loginData);
        const token = loginData.token;
        const user = loginData.user;
        console.log('JWT Token:', token);
        console.log('User data:', user);

        if (!token) throw new Error('No token returned from login');

        localStorage.setItem('username', user.nickname || user.username || 'Guest User');
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userAccount', account);
        localStorage.setItem('user', JSON.stringify(user));

        // let nickname = user.nickname || user.username || null;

        // if (!nickname) {
        //   nickname = account;

        //   const newNickname = prompt(
        //     `Nemate username, predlažemo da koristite adresu kao username:\n${nickname}\n\nŽelite li da promenite username? Ako da, unesite novi username:`,
        //     nickname
        //   );

        //   if (newNickname && newNickname.trim() !== '') {
        //     nickname = newNickname.trim();
        //   }

        //   const putResponse = await fetch('https://blockchain-hackathon-eth-ns-2025-backend-ezkq0h2ai.vercel.app/api/users', {
        //     method: 'PUT',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       'Authorization': `Bearer ${token}`
        //     },
        //     body: JSON.stringify({ nickname })
        //   });

        //   if (!putResponse.ok) throw new Error(`Updating nickname failed: ${putResponse.status}`);

        //   const putData = await putResponse.json();
        //   console.log('Nickname updated:', putData);
        // }

        // alert(`Uspešno ste se ulogovali kao: ${nickname}`);
        window.location.href = '/';

      } catch (error) {
        console.error(error);
        alert(`Greška: ${error.message}`);
      }
    });
  }
});
