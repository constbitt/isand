/*import AuthorPage from "@/src/components/Pages/author";

export default AuthorPage;

*/
// @ts-nocheck
import { wrapper } from '@/src/store/store';
import { getJournals } from "@/src/store/api/serverApi";
import JournalSearchPage from "@/src/components/Pages/journalSearchPage";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
      await store.dispatch(getJournals.initiate());
      const journalsResponse = getJournals.select()(store.getState());
      return {
        props: {
          journalsResponse,
        },
      };
    }
);

export default JournalSearchPage;

