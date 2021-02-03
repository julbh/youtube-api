import '../styles/globals.css'
import Layout from "../components/Layout";
import { withStyles } from "@material-ui/core/styles";

const theme = {
    spacing: 4,
    palette: {
        primary: "#007bff"
    }
};

function MyApp({ Component, pageProps }) {
  return (
          <Layout>
              <Component {...pageProps} />
          </Layout>

  )
}

export default MyApp
