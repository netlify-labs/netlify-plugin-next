import Head from 'next/head'
import Link from 'next/link'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Next Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <div>
          <Link href="/dynamic/[dynamic]" as="/dynamic/about">
            <a>Dynamic route 1</a>
          </Link>
        </div>
        <div>
          <Link href="/dynamic/[dynamic]" as="/dynamic/kkljdaklsjdasklj">
            <a>Dynamic route 2</a>
          </Link>
        </div>
        <div>
          <Link href="/dynamic/[dynamic]" as="/dynamic/2133131jasjaj">
            <a>Dynamic route 3</a>
          </Link>
        </div>
        <hr/>
        <div>
          <Link href="/other/[other]" as="/other/about">
            <a>other route 1</a>
          </Link>
        </div>
        <div>
          <Link href="/other/[other]" as="/other/kkljdaklsjdasklj">
            <a>other route 2</a>
          </Link>
        </div>
        <div>
          <Link href="/other/[other]" as="/other/2133131jasjaj">
            <a>other route 3</a>
          </Link>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-family: Menlo, Monaco, Lucida Console, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
