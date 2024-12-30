window.Buffer = buffer.Buffer;

const connectWalletButton = document.getElementById('connect-wallet');
const sendPaymentButton = document.getElementById('send-payment');
const walletAddressDisplay = document.getElementById('wallet-address');
const transactionStatus = document.getElementById('transaction-status');

let walletAddress = null;
const recipientAddress = '74odBETTBNbD6uMGwo59tdgt3oMagfsHVatmMYsLDz6c'; // Replace with the destination wallet

// Connect Phantom Wallet
connectWalletButton.addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            walletAddress = response.publicKey.toString();
            walletAddressDisplay.textContent = `Wallet Address: ${walletAddress}`;
            sendPaymentButton.disabled = false;
        } catch (err) {
            console.error('Connection failed:', err);
        }
    } else {
        alert('Phantom Wallet not found. Please install it.');
    }
});

// Send Payment
sendPaymentButton.addEventListener('click', async () => {
    if (!walletAddress) return alert('Connect your wallet first!');

    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
        const senderPublicKey = new solanaWeb3.PublicKey(walletAddress);
        const recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: senderPublicKey,
                toPubkey: recipientPublicKey,
                lamports: 0.1 * solanaWeb3.LAMPORTS_PER_SOL, // 0.1 SOL in lamports
            })
        );

        transaction.feePayer = senderPublicKey;
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;

        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        transactionStatus.textContent = `Transaction Successful! Signature: ${signature}`;
        console.log('Transaction successful:', signature);
    } catch (err) {
        transactionStatus.textContent = `Transaction Failed: ${err.message}`;
        console.error('Transaction failed:', err);
    }
});
