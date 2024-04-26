import { useRouter } from 'next/router';

export function Component() {
    const { query } = useRouter();

    if (query.a && query.b) {

    }
}