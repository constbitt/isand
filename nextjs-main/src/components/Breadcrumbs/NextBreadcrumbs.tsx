import { useRouter, NextRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";

interface Crumb {
    href: string;
    text: string;
}

const _defaultGetDefaultTextGenerator = (path: string, href?: string) => {
    return path;
};

const generateHref = (baseHref: string, query: ParsedUrlQuery) => {
    if (!baseHref.includes('dResult') && !baseHref.includes('sResult')) {
        return baseHref;
    }
    const queryParameters = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (key !== 'creature_id') {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    if (v !== undefined) {
                        queryParameters.append(key, v);
                    }
                });
            } else if (value !== undefined) {
                queryParameters.append(key, value);
            }
        }
    });

    const queryString = queryParameters.toString();
    return queryString ? `${baseHref}?${queryString}` : baseHref;
};

const generatePathParts = (pathStr: string) => {
    const pathWithoutQuery = pathStr.split("?")[0];
    return pathWithoutQuery.split("/")
        .filter((v) => v.length > 0);
};

export default function NextBreadcrumbs({
    getDefaultTextGenerator = _defaultGetDefaultTextGenerator,
}) {
    const router: NextRouter = useRouter();
    const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        const asPathNestedRoutes = generatePathParts(router.asPath);
    
        const crumblist: Crumb[] = asPathNestedRoutes.map((subpath, idx) => {
            const baseHref: string = "/" + asPathNestedRoutes.slice(0, idx + 1).join("/");
            const href = generateHref(baseHref, router.query);
    
            return {
                href,
                text: getDefaultTextGenerator(subpath, href)
            };
        });
    
        setIsCollapsed(true);
        setBreadcrumbs([{ href: "/", text: "Главная" }, ...crumblist]);
    }, [router.asPath, router.pathname, getDefaultTextGenerator, router.query]);

    const displayBreadcrumbs = () => {
        if (isCollapsed && breadcrumbs.length > 3) {
            const first = breadcrumbs[0];
            const second = { href: '#', text: '...' };
            const lastTwo = breadcrumbs.slice(-2);

            return [first, second, ...lastTwo];
        }
        return breadcrumbs;
    };

    return (
        <nav className="flex items-end overflow-x-auto max-w-[984px] whitespace-nowrap text-[#1b4596] text-5xl font-medium">
            {displayBreadcrumbs().map((crumb, idx, arr) => (
                <React.Fragment key={idx}>
                    {crumb.text === '...' ? (
                        <>
                            <p 
                                onClick={() => setIsCollapsed(false)}
                                style={{ cursor: 'pointer', color: 'inherit', margin: '0 20px', fontSize: '40px', fontWeight: 500, }}
                            >
                                {crumb.text}
                            </p>
                            <span style={{ margin: '0 20px', fontSize: 40, cursor: 'default', }}>›</span>
                        </>
                    ) : (
                        <>
                            {idx < arr.length - 1 ? (
                                <Link href={crumb.href} passHref style={{display: 'flex', fontSize: '40px', fontWeight: 500}}>
                                        {crumb.text}
                                </Link>
                            ) : (
                                <p style={{ fontSize: '40px', fontWeight: 500, textDecoration: 'none', color: 'inherit', cursor: 'default', }}>
                                    {crumb.text}
                                </p>
                            )}
                            {idx < arr.length - 1 && <span style={{ margin: '0 20px', fontSize: 40, cursor: 'default', }}>›</span>}
                        </>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
