import { Card } from '../components/ui/Card'

export default function WhyPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Why this program</h1>

      <Card className="flex flex-col gap-4 text-sm leading-relaxed text-body">
        <p>
          This program was built by comparing the popular calisthenics routines against the exercise-science
          evidence, for one specific person: untrained, carrying extra weight, with a shoulder that moves more
          than it should (hypermobile) and no pull-up bar. Nothing off the shelf fit that combination, so this
          is a hybrid: a two-week on-ramp, leverage-based exercise ladders, and an explicit progression rule,
          all on a schedule that survives a missed day.
        </p>

        <p>
          <strong className="text-ink">Why full-body, three times a week.</strong>{' '}
          Training each movement pattern at least twice a week builds strength faster than training it once,
          even at the same total volume, and on a full-body split, missing one session costs a third of the
          week&rsquo;s work, not an entire muscle group&rsquo;s only day. Every-other-day spacing also leaves a full
          rest day between sessions while the habit beds in.
        </p>

        <p>
          <strong className="text-ink">Why one set first.</strong> The prescription for
          deconditioned or obese beginners is to start at one working set of 8-12 reps. The strength gained per
          extra set is small in someone this untrained, so there is no reason to start anywhere but the floor.
          Sets rise to two, then three, only once the habit is established, around weeks 2 and 4.
        </p>

        <p>
          <strong className="text-ink">Why never to failure.</strong> Pushing a set to
          failure adds almost nothing extra to strength gains, and it is exactly where good form breaks down
          first. For this shoulder, that is where the shoulder blade loses control and wings. Every set stops
          a few reps short, at a pace that still feels productive.
        </p>

        <p>
          <strong className="text-ink">Why the push ladder starts with scapular
          control.</strong> "Shoulders collapse inward" during a push-up is usually the shoulder blade muscle
          (serratus anterior) failing to hold its position, not a strength problem in the chest or arms. The
          first four push levels are wall drills that train exactly that muscle before any body weight is
          loaded through the arm. This is deliberate, safe territory for a hypermobile shoulder: real strength
          work helps this kind of shoulder, as long as it stays short of the joint&rsquo;s end range, which these
          drills do by design.
        </p>

        <p>
          <strong className="text-ink">Why wrists go on fists.</strong> Pressing
          through a fully bent-back (extended) wrist on the floor raises pressure through the wrist joint.
          Resting on fists, forearms, or an elevated surface keeps the wrist closer to neutral, which is kinder
          to a wrist that already aches.
        </p>

        <p>
          <strong className="text-ink">Why no streaks, and only a 7-day weight
          average.</strong> A missed day does not undo a habit that is forming. A streak counter resetting
          to zero is exactly the kind of cue that makes people quit entirely rather than pick back up tomorrow.
          So this app never shows one. Body weight is similar: day-to-day weight swings from water and food are
          bigger than a realistic week&rsquo;s worth of fat loss, so only the 7-day trailing average is shown as the
          meaningful line. A single day&rsquo;s number is never the story.
        </p>

        <p>
          <strong className="text-ink">The six habits.</strong> Protein at every meal,
          vegetables or fruit at two meals, no sugary drinks, a glass of water before main meals, seven or more
          hours in bed, and hitting a walk target. No calorie or macro counting anywhere. These six checkboxes
          are the whole nutrition and recovery side of the program.
        </p>

        <p>
          <strong className="text-ink">What to expect in 8 weeks.</strong> Reps
          roughly double for most people in this time, and level-ups happen steadily across most of the five
          ladders. The scale usually moves more slowly and less predictably than the strength does. That is
          normal, not a sign anything is wrong.
        </p>

        <p>
          <strong className="text-ink">Honest limits.</strong> Without a bar, rings,
          or bands, the pulling ladder has a real ceiling around a controlled towel row. Past that point,
          progress needs a doorway bar or resistance bands. This app is not medical advice, and a shoulder that
          feels unstable is worth one physiotherapy assessment before starting.
        </p>

        <p className="text-muted">
          The full research synthesis, including every citation, lives in the repo at{' '}
          <code className="rounded bg-inset px-1 py-0.5 text-xs text-body">docs/RESEARCH.md</code>.
        </p>
      </Card>
    </div>
  )
}
