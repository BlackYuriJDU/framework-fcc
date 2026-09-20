# Autoloop v2

`OBSERVE → BASELINE → HYPOTHESIS → PLAN → CHANGE → RUN → VERIFY → EVALUATE → ADVERSARIAL CHECK → COMPARE → KEEP/REVERT → LEARN`

Every autonomous change must have an experiment id, baseline, success metric, evidence, and an explicit decision.

Hard gates:
- no metric => no autonomous keep
- failed evaluator => revert or iterate
- critical external action => approval gate
- max retries = 3
