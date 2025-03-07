import ProfilesImg from "@/src/assets/images/home/profiles.svg";
import RatingsImg from "@/src/assets/images/home/ratings.svg";
import GraphImg from "@/src/assets/images/home/graphs.svg";
import ThesaurusImg from "@/src/assets/images/home/thesaurus.svg";
import DistanceImg from "@/src/assets/images/home/distances.svg";
import SearchImg from "@/src/assets/images/home/search.svg";
import DeepsearchImg from "@/src/assets/images/home/deepSearch.svg";
import GlossaryImg from "@/src/assets/images/home/glossary.svg";
import {Card} from "@/src/store/types/homeTypes";

export const cards: readonly Card[] = [
    // {
    //     name: 'Текстовый\n поиск',
    //     text: 'На основании слова или фразы, введенной в строке поиска, позволяет найти релевантные публикации, учёных, журналы, конференции, организации и города',
    //     link: '/search',
    //     src: SearchImg,
    // },
    {
        name: 'Тематический\n поиск',
        text: 'Поиск публикаций, ученых, журналов, конференций, организаций и городов по заданным параметрам',
        link: '/deepSearch',
        src: DeepsearchImg,
    },
    {
        name: 'Тематические\n профили',
        text: 'Профили ученых, журналов, конференций',
        link: '/profiles',
        src: ProfilesImg,
    },
    /*
    {
        name: 'Профили\n журналов',
        text: 'Тематические профили журналов',
        link: '/journals',
        src: ProfilesImg,
    },
    {
        name: 'Профили\n конференций',
        text: 'Тематические профили конференций',
        link: '/conferences',
        src: ProfilesImg,
    },
    */
    {
        name: 'Тематическое\n ранжирование',
        text: 'Ранжированный список ученых по заданным параметрам',
        link: '/ratings',
        src: RatingsImg,
    },
    {
        name: 'Граф\n классификатора',
        text: 'Профиль ученого в виде графа, показывающего плотность занятости той или иной деятельностью',
        link: '/graphs',
        src: GraphImg,
    },
    {
        name: 'Граф\n глоссария',
        text: 'Граф взаимосвязи используемых терминов теории управления для выбранного ученого',
        link: '/thesaurus',
        src: ThesaurusImg,
    },
    // {
    //     name: 'Расстояния',
    //     text: 'Позволяет визуализировать на двумерной проекции профилей тематическую близость учёных, конференций и журналов',
    //     link: '/distances',
    //     src: DistanceImg,
    // },
    {
        name: 'Глоссарий',
        text: 'Список терминов теории управления и их определения',
        link: '/glossary',
        src: GlossaryImg,
    },

]

export const mainLinks: readonly Card[] = [
    {
        name: 'Список\n авторов',
        text: 'Полный список ученых',
        link: '/authors',
        src: GraphImg,
    },
    {
        name: 'Список\n публикаций',
        text: 'Полный список публикаций',
        link: '/publications',
        src: ThesaurusImg,
    },

    {
        name: 'tmpPage',
        text: 'Временная страница',
        link: '/tmpPage',
        src: ThesaurusImg,
    }
]