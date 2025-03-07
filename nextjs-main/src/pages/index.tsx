import React from "react";
import CardItem from "@/src/components/Home/CardItem";
import { cards } from "@/src/configs/homeConfig";
import { mainLinks } from "@/src/configs/homeConfig";
import Head from 'next/head';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useGetTotalCountQuery } from "../store/api/serverApiV3";
import { Stack, Typography } from "@mui/material";
import Link from 'next/link';
import ProfilesImg from "@/src/assets/images/home/profiles.svg";
import Image from "next/image";

const slides: string[] = [];
for (let i = 0; i <= 21; i++) {
    slides.push(`images/presentation/isand${i === 0 ? '' : i}.svg`);
}

const PrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ 
                ...style, 
                display: "block", 
                backgroundColor: '#1b4596',
                borderRadius: '50%',
            }}
            onClick={onClick}
        />
    );
};

const NextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ 
                ...style, 
                display: "block", 
                backgroundColor: '#1b4596',
                borderRadius: '50%',
            }}
            onClick={onClick}
        />
    );
};

const SlideShow = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    return (
        <div className="w-[67.5vw] px-8 py-6 rounded-[32px] mt-[40px] shadow-[4px_4px_32px_0_rgba(0,34,102,0.15)]">
            <Slider {...settings}>
                {slides.map((slide, index) => (
                    <div key={index} style={{ width: '100%', height: '100%' }}>
                        <img src={slide} alt={`Slide ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

const Home = (): React.ReactElement => {
    const { data } = useGetTotalCountQuery();

    return (
        <>
            <Head>
                <title>Домашняя страница</title>
            </Head>
            <main className="flex flex-col items-center">
                <h1 className="w-[67.5vw] text-blue-main text-[48px] text-center font-bold" style={{ lineHeight: 1.15 }}>
                    Информационная система анализа научной деятельности
                </h1>
                <div className="w-[67.5vw] mt-[52px] grid grid-cols-3 gap-5">
                {cards.map((item, index) => {

        return (
            <CardItem
                link={item.link}
                name={item.name}
                src={item.src}
                text={item.text}
                key={index}
            />
        );
    })}
                </div>
                <SlideShow />
                {data && (
                    <Stack spacing={4} mt={4} direction={'row'} sx={{ justifyContent: 'center' }}>
                        <Link href={mainLinks[0].link} passHref>
                            <Typography         
                            variant="h5" 
                            component="a" 
                            sx={{ cursor: 'pointer' }}>
                                {`Количество авторов: `} <span className="text-blue-main">{data?.authors}</span>
                            </Typography>
                        </Link>
                        <Link href={mainLinks[1].link} passHref>
                            <Typography         
                            variant="h5" 
                            component="a" 
                            sx={{ cursor: 'pointer' }}>
                                {`Количество публикаций: `} <span className="text-blue-main">{data?.publications}</span>
                            </Typography>
                        </Link>
                    </Stack>
                )}
            </main>
        </>
    );
};

export default Home;
