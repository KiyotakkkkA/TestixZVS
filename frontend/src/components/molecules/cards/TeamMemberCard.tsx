import { Icon } from "@iconify/react";

export type TeamMemberSocialLink = {
    type: "tg" | "github" | string;
    icon: string;
    url: string;
};

export type TeamMemberCardProps = {
    firstname: string;
    surname: string;
    pseudonym?: string;
    roles: string[];
    bio?: string;
    socials?: TeamMemberSocialLink[];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/g);
  const first = parts[0]?.[0] ?? 'A';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
};

export const TeamMemberCard = ({ firstname, surname, pseudonym, roles, bio, socials }: TeamMemberCardProps) => {

    const socialBaseStyles = 'border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
    const socialStylesTable = {
        tg: 'bg-blue-400 text-white hover:bg-blue-500',
        github: 'bg-slate-800 text-white hover:bg-slate-900',
        vk: 'bg-blue-500 text-white hover:bg-blue-600',
    }

    return (
        <div className="flex gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-1 items-start gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-indigo-100 text-indigo-700">
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                    {getInitials(firstname + ' ' + surname)}
                    </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                        <div className="text-base font-semibold text-slate-800">{firstname}</div>
                        {pseudonym && <div className="text-base font-semibold text-indigo-600">"{pseudonym}"</div>}
                        <div className="text-base font-semibold text-slate-800">{surname}</div>
                    </div>
                    {roles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                                <span
                                    key={role}
                                    className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    )}
                    {bio && <p className="text-sm text-slate-600">{bio}</p>}
                </div>
            </div>
            {socials && socials.length > 0 && (
                <div className="inline-flex h-fit w-fit self-start flex-shrink-0 flex-col items-start gap-2 rounded-full border p-1 shadow-md">
                    {socials.map((social) => {

                        const currentSocialStyles = socialStylesTable[social.type as keyof typeof socialStylesTable] ?? socialBaseStyles;
                        
                        return (
                            <a
                                key={social.url}
                                href={social.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`rounded-full transition-colors p-[0.33rem] ${currentSocialStyles}`}
                            >
                                <Icon icon={social.icon} className="h-5 w-5" />
                            </a>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
