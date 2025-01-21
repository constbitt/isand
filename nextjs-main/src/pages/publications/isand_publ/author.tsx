// @ts-nocheck
/*
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Stack } from "@mui/material";
import Head from "next/head";
import AuthorPersonHatCard from "@/src/components/Cards/AuthorPersonHat";
import ScienceObjectReview from "@/src/components/CenterContainer/ScienceObjectReview";
import { useGetAuthorInfoQuery } from "@/src/store/api/serverApiV3";
import { getAuthors } from "@/src/store/api/serverApi";
import { wrapper } from "@/src/store/store";
import { ApiResponse } from "@/src/store/types/apiTypes";
import { Author } from "@/src/store/types/authorTypes";
import AuthorSearchPage from "@/src/components/Pages/authorSearchPage";

const getQueryParameter = (url: string, parameter: string) => {
  const urlParams = new URLSearchParams(url);
  return urlParams.get(parameter);
};

const AuthorPage1: React.FC<{ authorsResponse: ApiResponse<Author[]> }> = ({ authorsResponse }) => {
  const { data: authors, error: authorsError } = authorsResponse;
  const [authorId, setAuthorId] = useState<number | null>(null);

  useEffect(() => {
    const authorFio = getQueryParameter(window.location.href, "author_fio");
    if (authors && authorFio) {
      const foundAuthor = authors.find((author) => author.value === authorFio);
      setAuthorId(foundAuthor?.id || null);
    }
  }, [authors]);

  // Always call the hook, but conditionally render the content
  const { data: author, isLoading, error } = useGetAuthorInfoQuery(authorId, {
    skip: authorId === null,
  });

  if (authorId !== null) {
    return <AuthorSearchPage authorsResponse={authorsResponse} />;
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Профиль автора</title>
        </Head>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error || !author) {
    return (
      <>
        <Head>
          <title>Профиль автора</title>
        </Head>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div>Автор не найден</div>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Профиль автора</title>
      </Head>
      <Container>
        <Stack spacing={2} sx={{ mt: "60px", justifyContent: "center", width: "100%" }}>
          <AuthorPersonHatCard
            author={{
              a_fio: author.fio,
              a_aff_org_name: author.affiliation || "",
              avatar: author.avatar || "",
            }}
          />
          <ScienceObjectReview
            idAuthor={authorId}
            citations={author.citations || []}
            publications={author.publications || []}
            description={author.description || ""}
            geoposition={author.geoposition || ""}
            ids={author.ids || []}
            objectType="authors"
          />
        </Stack>
      </Container>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    const authorsResponse = await store.dispatch(getAuthors.initiate());

    return {
      props: {
        authorsResponse,
      },
    };
  }
);

export default AuthorPage1;
*/

// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Stack } from "@mui/material";
import Head from "next/head";
import AuthorPersonHatCard from "@/src/components/Cards/AuthorPersonHat";
import ScienceObjectReview from "@/src/components/CenterContainer/ScienceObjectReview";
import { useGetAuthorInfoQuery } from "@/src/store/api/serverApiV3";
import { useGetAuthorByFioQuery } from "@/src/store/api/serverApiV2_5";
import { getAuthors } from "@/src/store/api/serverApi";
import { wrapper } from "@/src/store/store";
import { ApiResponse } from "@/src/store/types/apiTypes";
import { Author } from "@/src/store/types/authorTypes";
import AuthorSearchPage from "@/src/components/Pages/authorSearchPage";

const getQueryParameter = (url: string, parameter: string) => {
  const urlParams = new URLSearchParams(url);
  return urlParams.get(parameter);
};

const AuthorPage1: React.FC<{ authorsResponse: ApiResponse<Author[]> }> = ({ authorsResponse }) => {
  const { data: authors, error: authorsError } = authorsResponse;
  const [authorId, setAuthorId] = useState<number | null>(null);

  useEffect(() => {
    const authorFio = getQueryParameter(window.location.href, "author_fio");
    if (authors && authorFio) {
      const foundAuthor = authors.find((author) => author.value === authorFio);
      setAuthorId(foundAuthor?.id || null);
    }
  }, [authors]);

  const { data: author, isLoading, error } = useGetAuthorInfoQuery(authorId, {
    skip: authorId === null,
  });



  //if (authorId !== null) {
    return <AuthorSearchPage authorsResponse={authorsResponse} />;
  //}

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Профиль автора</title>
        </Head>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error || !author) {
    return (
      <>
        <Head>
          <title>Профиль автора</title>
        </Head>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div>Автор не найден</div>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Профиль автора</title>
      </Head>
      <Container>
        <Stack spacing={2} sx={{ mt: "60px", justifyContent: "center", width: "100%" }}>
          <AuthorPersonHatCard
            author={{
              a_fio: author.fio,
              a_aff_org_name: author.affiliation || "",
              avatar: author.avatar || "",
            }}
          />
          <ScienceObjectReview
            idAuthor={authorId}
            citations={author.citations || []}
            publications={author.publications || []}
            description={author.description || ""}
            geoposition={author.geoposition || ""}
            ids={author.ids || []}
            objectType="authors"
          />
        </Stack>
      </Container>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    const authorsResponse = await store.dispatch(getAuthors.initiate());

    return {
      props: {
        authorsResponse,
      },
    };
  }
);

export default AuthorPage1;
