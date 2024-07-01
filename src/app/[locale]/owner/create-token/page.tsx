import { getAllActiveTokens } from '@owner/data';
import CreateOwnerTokenForm from '@owner/ui/page/create-owner-token/CreateOwnerTokenForm';
import { redirect } from 'next/navigation';

export default async function CreateTokenPage() {
    const ownerTokens = await getAllActiveTokens();

    if (ownerTokens.length !== 0) {
        redirect('/owner/sign-in/');
    }

    return <CreateOwnerTokenForm />;
}
