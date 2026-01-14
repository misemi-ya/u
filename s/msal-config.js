// ▼▼▼ ここをAzure Portalの情報に書き換えてください ▼▼▼
const msalConfig = {
    auth: {
        clientId: "cb393cd5-c329-40f3-96ae-6f5c943a4293", 
        authority: "https://login.microsoftonline.com/f26d3362-79fe-4262-817a-531c7cdbf597",
        // ログイン後のリダイレクト先（index.htmlのURL）
        redirectUri: window.location.origin + window.location.pathname
    },
    cache: {
        cacheLocation: "sessionStorage", // セッションストレージに保存
        storeAuthStateInCookie: false,
    }
};

// ログイン要求のスコープ（ユーザーの基本情報を取得）
const loginRequest = {
    scopes: ["User.Read"]
};

// MSALインスタンスの作成
const myMSALObj = new msal.PublicClientApplication(msalConfig);
