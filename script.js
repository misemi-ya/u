document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.getElementById('copyButton'); // Changed to ID
    const emailToCopy = document.getElementById('copyEmail'); // Changed to ID

    if (copyButton && emailToCopy) {
        copyButton.addEventListener('click', async function() {
            const emailAddress = emailToCopy.textContent;
            try {
                await navigator.clipboard.writeText(emailAddress);
                console.log('メールアドレスがコピーされました！');

                // 任意: コピー成功のフィードバック
                const originalButtonText = copyButton.textContent;
                const originalBgColor = copyButton.style.backgroundColor;
                const originalBorderColor = copyButton.style.borderColor;
                const originalColor = copyButton.style.color;

                copyButton.textContent = 'コピーしました！';
                copyButton.style.backgroundColor = '#28a745'; // 緑色にする
                copyButton.style.borderColor = '#28a745';
                copyButton.style.color = '#fff';

                setTimeout(() => {
                    copyButton.textContent = originalButtonText;
                    copyButton.style.backgroundColor = originalBgColor; // 元の色に戻す
                    copyButton.style.borderColor = originalBorderColor;
                    copyButton.style.color = originalColor;
                }, 2000); // 2秒後に元のテキストとスタイルに戻す

            } catch (err) {
                console.error('メールアドレスのコピーに失敗しました: ', err);
                alert('メールアドレスのコピーに失敗しました。お使いのブラウザでは自動コピーがサポートされていないか、権限がありません。手動でコピーしてください: ' + emailAddress);
            }
        });
    }
});