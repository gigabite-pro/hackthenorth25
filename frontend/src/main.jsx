import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

const root = createRoot(document.getElementById("root"));

root.render(
    <Auth0Provider
        domain="dev-3eayae31z7ls84il.ca.auth0.com"
        clientId="700cq6duzimp3Qkkc5Bw51WVEIyPfaTk"
        authorizationParams={{
            redirect_uri: window.location.origin,
        }}
    >
        <App />
    </Auth0Provider>
);
