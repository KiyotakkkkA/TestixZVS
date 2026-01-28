import { projectParticipants, teamMembers } from '../../../data/projectMembers';
import { TeamMemberCard } from '../../molecules/cards';

export const OurTeamPage = () => {
  return (
    <div className="space-y-6 mx-auto">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-semibold text-slate-800">Наша команда</div>
        <div className="mt-2 text-sm text-slate-500">
          Люди, которые развивают платформу и заботятся о её качестве.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {teamMembers.map((member) => (
          <TeamMemberCard key={member.surname} {...member} />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-800">Отдельная благодарность</div>
            <div className="mt-1 text-sm text-slate-500">
              Тем, кто хоть и не является постоянным членом команды, но внёс свой вклад в развитие проекта.
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Спасибо за вклад
          </span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {projectParticipants.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
