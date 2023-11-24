# Recommended Git Branching Strategy

**Branch Organization**

During the development process, we follow a version control strategy based on Gitflow. We define and manage branches in Git as follows:

* There are two main, permanent branches: **master** and **develop**.
  * **master** corresponds to the branch with tested and stable production code (also known as _main_).
  * **develop** contains ongoing, potentially unstable development code, where feature branches are merged.
* In addition to the main branches, there will be _feature_, _release_, and _hotfix_ branches.
* Feature branches (or **features**) branch off from _develop_ and are merged back into _develop_.
  * These branches are named as _"feature/name-of-feature"_. The name should never start with "hotfix" or "release".
  * To merge a completed feature branch, a _Pull-Request_ to **develop** is made.
* For each deployment, _release_ branches are created from _develop_, where changes to be deployed are tested.
  * These are named as _"release-..."_.
  * Once the code in a release branch is tested and stable, it is merged into both _develop_ and _master_.
  * Each release deployed on _master_ is tagged to identify the code version, following the `vX.Y.Z` format (e.g., `v1.0.0`).
  * In summary, every commit to _master_ is a _release_



<figure><img src=".gitbook/assets/04 Hotfix branches (1).svg" alt=""><figcaption></figcaption></figure>
