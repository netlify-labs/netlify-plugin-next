import Link from 'next/link'
import Error from 'next/error'
import Skeleton from '@components/Skeleton'
import ActualComponent from '@components/ActualComponent'
import { useRouter } from 'next/router'

export async function getStaticPaths() {
  return { paths: [], fallback: true }
}

export async function getStaticProps({ params }) {
  const { dynamic } = params

  try {
    return {
      props: {
        hello: dynamic
      }
    }
  } catch (error) {
    console.error(error)
    return { props: {} }
  }
}

export default function Tweet({ date, hello }) {
  const { isFallback } = useRouter()

  if (!isFallback && !hello) {
    return <Error statusCode={404} title="This page errored" />
  }

  return (
    <div className={`page-wrapper`}>
      <h1>It worked</h1>
      <main>
        {isFallback ? <Skeleton /> : <ActualComponent hello={hello} />}

        <footer>
          <p>
            {isFallback
              ? 'This page is statically generating & from CDN'
              : 'This page not statically generated, it is from serverless function'}
          </p>
        </footer>
      </main>

      <style jsx>{`
        .page-wrapper {
          color: var(--tweet-font-color);
          background: var(--bg-color);
          height: 100vh;
          overflow: auto;
          padding: 2rem 1rem;
        }
      `}</style>
    </div>
  )
}
