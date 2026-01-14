document.getElementById('admissionEmailForm').addEventListener('submit', function(event) {
    event.preventDefault(); // フォームのデフォルト送信を防止

    const applicantEmail = document.getElementById('applicantEmail').value;
    const messageElement = document.getElementById('message');

    if (!applicantEmail) {
        messageElement.textContent = 'メールアドレスを入力してください。';
        messageElement.style.color = 'red';
        return;
    }

    messageElement.textContent = 'メールを送信しています...';
    messageElement.style.color = 'blue';

    // ここでサーバーサイドのAPIエンドポイントにデータを送信します
    // 例: /api/send-admission-email は、あなたのサーバー上のメール送信処理を行う場所を指します
    fetch('/api/send-admission-email', { // ここをあなたのサーバーのURLに変更してください
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: applicantEmail }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageElement.textContent = '合格発表メールが送信されました！';
            messageElement.style.color = 'green';
            // フォームをクリアすることも可能
            document.getElementById('applicantEmail').value = ''; 
        } else {
            messageElement.textContent = `メール送信に失敗しました: ${data.message}`;
            messageElement.style.color = 'red';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        messageElement.textContent = '通信エラーが発生しました。時間をおいて再度お試しください。';
        messageElement.style.color = 'red';
    });
});