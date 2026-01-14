<?php
header('Content-Type: application/json');

// PHPMailerのautoloadファイルを読み込む
// composerでインストールした場合: require 'vendor/autoload.php';
// 手動でファイルを置いた場合: require 'path/to/PHPMailer/src/PHPMailer.php';
//                     require 'path/to/PHPMailer/src/SMTP.php';
//                     require 'path/to/PHPMailer/src/Exception.php';

// 例としてPHPMailerのautoloadを使用しますが、環境に合わせて調整してください。
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP; // SMTPを使用する場合

// エラーハンドリング
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$applicantEmail = $input['email'] ?? null;

if (empty($applicantEmail) || !filter_var($applicantEmail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => '無効なメールアドレスです。']);
    exit;
}

// ここで、メールアドレスに紐づく合格情報（ここでは常に合格とする）をデータベースなどから取得する処理が入る

// 1から3000まで順番に変更する部分
// 実際のシステムでは、この番号は永続化されたカウンターやデータベースから取得します
// ここでは簡易的にファイルに保存する例を示しますが、本番環境ではデータベース推奨
$counter_file = 'email_counter.txt';
$current_count = 1;
if (file_exists($counter_file)) {
    $current_count = (int)file_get_contents($counter_file);
    if ($current_count >= 3000) {
        $current_count = 1; // 3000を超えたらリセット
    } else {
        $current_count++;
    }
}
file_put_contents($counter_file, $current_count);

$from_email_prefix = sprintf("misemi-ya-edu-university-%04d", $current_count); // 0埋め4桁
$from_email = "{$from_email_prefix}@misemiyamail.onmicrosoft.com"; // 送信元メールアドレス

$mail = new PHPMailer(true); // 例外を有効にする

try {
    // サーバー設定
    $mail->isSMTP(); // SMTPを使用する
    $mail->Host       = 'smtp.mail.com'; // メール送信に使用するSMTPサーバーホスト名
    $mail->SMTPAuth   = true;                                   // SMTP認証を有効にする
    $mail->Username   = 'misemi-ya-u-i@mail.com';       // SMTPユーザー名 (送信元のアカウント)
    $mail->Password   = 'YOUR_SMTP_PASSWORD';               // SMTPパスワード (非常に重要: 適切な方法で管理してください)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            // TLS暗号化を有効にする (ssl/tls)
    $mail->Port       = 465;                                    // TCPポート (465 for SMTPS, 587 for TLS)
    $mail->CharSet    = 'UTF-8';                                // 文字コード設定

    // 受信者
    $mail->setFrom('misemi-ya-u-i@mail.com', '店魅偉屋大学'); // 実際にメールを送信するアカウント
    $mail->addAddress($applicantEmail);                       // 受信者メールアドレス

    // コンテンツ
    $mail->isHTML(false); // HTMLメールではない (プレーンテキスト)
    $mail->Subject = '店魅偉屋大学入試試験合格発表';
    $mail->Body    = "{$applicantEmail}様は店魅偉屋大学に合格となりました。\n入学案内などは大学ホームページをご覧ください。\nメールアドレス : {$from_email}";

    $mail->send();
    echo json_encode(['success' => true, 'message' => '合格発表メールを送信しました。']);

} catch (Exception $e) {
    // エラーログを記録 (本番環境では必須)
    error_log("メール送信エラー: {$mail->ErrorInfo}");
    echo json_encode(['success' => false, 'message' => 'メールの送信に失敗しました。時間をおいて再度お試しください。']);
}
?>