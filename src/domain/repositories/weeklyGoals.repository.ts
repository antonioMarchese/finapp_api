import { Currency } from 'src/types/currency';
import UpdateWeeklyGoalsDTO from 'src/types/weeklyGoals/updateWeeklyGoalsDTO';
import WeeklyGoalsDTO from 'src/types/weeklyGoals/weeklyGoalsDTO';

export default abstract class WeeklyGoalsRepository<Entity> {
  // Reads the single goals row, creating it empty in `defaultCurrency` on
  // first access.
  abstract get(defaultCurrency: Currency): Promise<WeeklyGoalsDTO>;
  // Updates the goals and any category budgets in one go.
  abstract update(
    props: UpdateWeeklyGoalsDTO,
    defaultCurrency: Currency,
  ): Promise<WeeklyGoalsDTO>;

  abstract toDTO(goals: Entity): WeeklyGoalsDTO;
}
