import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import PageLayout from '../components/PageLayout';

interface PageProps {
  title: string;
  content: string;
  slug: string;
}

export default function Page({ title, content, slug }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join('content', 'pages'));
  
  const paths = files.map(filename => ({
    params: {
      slug: filename.replace('.md', '')
    }
  }));
  
  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const markdownWithMeta = fs.readFileSync(path.join('content', 'pages', `${slug}.md`), 'utf-8');
  
  const { data, content } = matter(markdownWithMeta);
  const htmlContent = marked(content);
  
  return {
    props: {
      title: data.title,
      content: htmlContent,
      slug
    }
  };
}; 