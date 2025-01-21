/*import AuthorPage from "@/src/components/Pages/author";

export default AuthorPage;

*/
// @ts-nocheck
import { wrapper } from '@/src/store/store';
import { getAuthors } from "@/src/store/api/serverApi";
import AuthorSearchPage from "@/src/components/Pages/authorSearchPage";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
      await store.dispatch(getAuthors.initiate());
      const authorsResponse = getAuthors.select()(store.getState());
  
      return {
        props: {
          authorsResponse,
        },
      };
    }
);

export default AuthorSearchPage;