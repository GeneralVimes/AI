# Setting up the tournament of Bachet bots

1. Open the folder Tournament
2. Run index.html from it
3. Start the tournament of triplets of bots, running the command in the console:

```javascript
window.world.startTournamentBetweenBots([new BachetBot1("B1"),new BachetBot2("B2"),new BachetBot3("B3"), new BachetBotRandom("RND"), new BachetBot123Best("Best"), new BachetBot123Best2("Best2"), new BachetBot123BestWithMistakes("NotBest")], 1000, 3, false)
```
^^^ the parameter of 3 instructs the game world to run the games between the triplets, not the pairs of the bots.

4. You will see the bots results. The behaviour of currently available bots is such:
- BachetBot1: always takes 1 stone
- BachetBot2: always takes 2, if 1 stone is left will take 1
- BachetBot3: always takes 3, if less are left will take less
- BachetBotRandom: takes random number of stones among those which are available
- BachetBot123Best: if it's possible to leave 4, 8, 12, 16, 20, etc stones to the opponent, does this, otherwise takes a random amount
- BachetBot123Best2: if it's possible to leave 4, 8, 12, 16, 20, etc stones to the opponent, does this, otherwise takes 2 stones
- BachetBot123BestWithMistakes: with a probability of 70% uses the BachetBot123Best's strategy, othewise takes random available amount

5. You task is to add your own bot into bots.js file. This bot should win over existing bots in the tournament in the triplets, and presumably, in the bigger tournament where the bots by other students will participate

6. We invite you to try making bots for other game rules variations. You can check some as commented lines in main.js

Good luck!